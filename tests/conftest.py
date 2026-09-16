import sqlite3
from collections.abc import Iterator
from pathlib import Path

import pytest

from weather_analysis.database import connect, create_schema
from weather_analysis.seed import seed_all


@pytest.fixture
def connection(tmp_path: Path) -> Iterator[sqlite3.Connection]:
    database_path = tmp_path / "weather-test.db"
    database_connection = connect(database_path)
    create_schema(database_connection)
    seed_all(database_connection)
    database_connection.commit()
    try:
        yield database_connection
    finally:
        database_connection.close()
