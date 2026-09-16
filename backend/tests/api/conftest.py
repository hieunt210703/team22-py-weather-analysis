from collections.abc import Iterator
from pathlib import Path

import pytest
from fastapi.testclient import TestClient

from weather_analysis.api.app import app


@pytest.fixture
def client(monkeypatch: pytest.MonkeyPatch, tmp_path: Path) -> Iterator[TestClient]:
    database_path = tmp_path / "weather-api-test.db"
    monkeypatch.setenv("WEATHER_DB_PATH", str(database_path))

    with TestClient(app) as test_client:
        yield test_client
