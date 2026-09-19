from collections.abc import Iterator

import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from weather_analysis.api.app import app


@pytest.fixture
def client(
    monkeypatch: pytest.MonkeyPatch,
    test_database_url: str,
    session: Session,
) -> Iterator[TestClient]:
    monkeypatch.setenv("WEATHER_DB_URL", test_database_url)

    with TestClient(app) as test_client:
        yield test_client
