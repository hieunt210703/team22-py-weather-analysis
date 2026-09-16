import sqlite3
from collections.abc import Iterator
from contextlib import contextmanager
from pathlib import Path

from weather_analysis.config import get_database_path


def connect(database_path: Path | None = None) -> sqlite3.Connection:
    """Mở kết nối SQLite đã bật ràng buộc khóa ngoại."""
    path = database_path or get_database_path()
    path.parent.mkdir(parents=True, exist_ok=True)
    connection = sqlite3.connect(path)
    connection.row_factory = sqlite3.Row
    connection.execute("PRAGMA foreign_keys = ON")
    return connection


@contextmanager
def connection_scope(database_path: Path | None = None) -> Iterator[sqlite3.Connection]:
    """Quản lý vòng đời và giao dịch của một kết nối cơ sở dữ liệu."""
    connection = connect(database_path)
    try:
        yield connection
        connection.commit()
    except Exception:
        connection.rollback()
        raise
    finally:
        connection.close()


def create_schema(connection: sqlite3.Connection) -> None:
    """Tạo các bảng dữ liệu cần thiết nếu chưa tồn tại."""
    connection.executescript(
        """
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT NOT NULL UNIQUE,
            password_hash TEXT NOT NULL,
            created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS cities (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL UNIQUE
        );

        CREATE TABLE IF NOT EXISTS monthly_temperatures (
            city_id INTEGER NOT NULL REFERENCES cities(id),
            month INTEGER NOT NULL CHECK (month BETWEEN 1 AND 12),
            avg_temperature REAL NOT NULL,
            PRIMARY KEY (city_id, month)
        );
        """
    )
