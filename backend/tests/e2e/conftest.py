import os
import sys
from collections.abc import Iterator
from pathlib import Path

import pytest

from tests.e2e.servers import run_server


BACKEND_DIRECTORY = Path(__file__).resolve().parents[2]
FRONTEND_DIRECTORY = BACKEND_DIRECTORY.parent / "frontend"
BACKEND_URL = "http://127.0.0.1:8001"
FRONTEND_URL = "http://127.0.0.1:5174"


@pytest.fixture(scope="session")
def backend_server(test_database_url: str) -> Iterator[str]:
    """Chạy backend với database kiểm thử riêng."""
    environment = {**os.environ, "WEATHER_DB_URL": test_database_url}
    command = [
        sys.executable,
        "-m",
        "uvicorn",
        "weather_analysis.api.app:app",
        "--port",
        "8001",
    ]

    with run_server(
        command,
        cwd=BACKEND_DIRECTORY,
        env=environment,
        ready_url=f"{BACKEND_URL}/api/auth/me",
    ):
        yield BACKEND_URL


@pytest.fixture(scope="session")
def frontend_server(backend_server: str) -> Iterator[str]:
    """Chạy Vite và chuyển tiếp API tới backend kiểm thử."""
    environment = {**os.environ, "WEATHER_API_URL": backend_server}
    command = [
        "node",
        "node_modules/vite/bin/vite.js",
        "--host",
        "127.0.0.1",
        "--port",
        "5174",
        "--strictPort",
    ]

    with run_server(
        command,
        cwd=FRONTEND_DIRECTORY,
        env=environment,
        ready_url=FRONTEND_URL,
    ):
        yield FRONTEND_URL


@pytest.fixture(scope="session")
def base_url(frontend_server: str) -> str:
    """Cung cấp URL frontend cho các thao tác điều hướng tương đối."""
    return frontend_server
