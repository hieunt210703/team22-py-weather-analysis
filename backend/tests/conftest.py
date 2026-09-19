from collections.abc import Iterator
from uuid import uuid4

import pytest
from sqlalchemy import create_engine, text
from sqlalchemy.orm import Session

from weather_analysis.config import build_localdb_url, get_database_url
from weather_analysis.database import (
    Base,
    ensure_database_exists,
    get_engine,
    session_scope,
    upgrade_database,
)
from weather_analysis.seed import seed_all


@pytest.fixture(scope="session")
def test_database_url(tmp_path_factory: pytest.TempPathFactory) -> Iterator[str]:
    database_name = f"WeatherAnalysisTest_{uuid4().hex[:8]}"
    data_directory = tmp_path_factory.mktemp("localdb")
    environment = pytest.MonkeyPatch()
    environment.delenv("WEATHER_DB_URL", raising=False)
    environment.setenv("WEATHER_DB_NAME", database_name)
    environment.setenv("WEATHER_DB_DIR", str(data_directory))

    ensure_database_exists()
    database_url = get_database_url()
    upgrade_database()
    try:
        yield database_url
    finally:
        get_engine().dispose()
        master_engine = create_engine(
            build_localdb_url("master"), isolation_level="AUTOCOMMIT"
        )
        try:
            with master_engine.connect() as connection:
                connection.execute(
                    text(
                        f"""
                        IF DB_ID(:database_name) IS NOT NULL
                        BEGIN
                            ALTER DATABASE [{database_name}]
                                SET SINGLE_USER WITH ROLLBACK IMMEDIATE;
                            DROP DATABASE [{database_name}];
                        END
                        """
                    ),
                    {"database_name": database_name},
                )
        finally:
            master_engine.dispose()
            environment.undo()


@pytest.fixture
def session(test_database_url: str) -> Iterator[Session]:
    engine = get_engine()
    with session_scope() as setup_session:
        for table in reversed(Base.metadata.sorted_tables):
            setup_session.execute(table.delete())
        seed_all(setup_session)

    database_session = Session(engine)
    try:
        yield database_session
    finally:
        database_session.rollback()
        database_session.close()
