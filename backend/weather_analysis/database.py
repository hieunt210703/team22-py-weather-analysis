import os
import re
from collections.abc import Iterator
from contextlib import contextmanager

from sqlalchemy import create_engine, text
from sqlalchemy.engine import Engine
from sqlalchemy.orm import DeclarativeBase, Session

from weather_analysis.config import (
    build_localdb_url,
    get_data_directory,
    get_database_file_path,
    get_database_name,
    get_database_url,
)


class Base(DeclarativeBase):
    """Lớp cơ sở cho các model ORM."""


_engines: dict[str, Engine] = {}


def get_engine() -> Engine:
    """Lấy engine tương ứng với URL cấu hình hiện tại."""
    database_url = get_database_url()
    if database_url not in _engines:
        _engines[database_url] = create_engine(database_url)
    return _engines[database_url]


def _sql_string(value: str) -> str:
    return value.replace("'", "''")


@contextmanager
def session_scope() -> Iterator[Session]:
    """Quản lý vòng đời và giao dịch của một database session."""
    session = Session(get_engine())
    try:
        yield session
        session.commit()
    except Exception:
        session.rollback()
        raise
    finally:
        session.close()


def ensure_database_exists() -> None:
    """Tạo hoặc attach database LocalDB khi dùng cấu hình mặc định."""
    if os.environ.get("WEATHER_DB_URL"):
        return

    database_name = get_database_name()
    if re.fullmatch(r"[A-Za-z0-9_]+", database_name) is None:
        raise ValueError("Tên cơ sở dữ liệu chỉ được chứa chữ, số và dấu gạch dưới")

    data_directory = get_data_directory()
    data_directory.mkdir(parents=True, exist_ok=True)
    database_file = get_database_file_path().resolve()
    log_file = database_file.with_name(f"{database_name}_log.ldf")

    escaped_name = _sql_string(database_name)
    escaped_database_file = _sql_string(str(database_file))
    escaped_log_file = _sql_string(str(log_file))
    if database_file.exists():
        create_statement = (
            f"CREATE DATABASE [{database_name}] "
            f"ON (FILENAME = N'{escaped_database_file}') FOR ATTACH"
        )
    else:
        create_statement = (
            f"CREATE DATABASE [{database_name}] "
            f"ON (NAME = N'{escaped_name}', FILENAME = N'{escaped_database_file}') "
            f"LOG ON (NAME = N'{escaped_name}_log', FILENAME = N'{escaped_log_file}')"
        )

    master_engine = create_engine(
        build_localdb_url("master"), isolation_level="AUTOCOMMIT"
    )
    try:
        with master_engine.connect() as connection:
            connection.execute(
                text(
                    f"""
                    IF DB_ID(:database_name) IS NULL
                    BEGIN
                        {create_statement}
                    END
                    """
                ),
                {"database_name": database_name},
            )
    finally:
        master_engine.dispose()


def create_schema() -> None:
    """Tạo các bảng dữ liệu cần thiết nếu chưa tồn tại."""
    from weather_analysis.models import User

    User.metadata.create_all(get_engine())
