import os
import subprocess
import sys
import time
import urllib.request
from collections.abc import Iterator
from pathlib import Path

import pytest


SERVER_PORT = 8765
SERVER_URL = f"http://localhost:{SERVER_PORT}"


def _wait_until_ready(process: subprocess.Popen[bytes], timeout_seconds: float) -> None:
    health_url = f"{SERVER_URL}/_stcore/health"
    deadline = time.monotonic() + timeout_seconds
    while time.monotonic() < deadline:
        if process.poll() is not None:
            raise RuntimeError("Máy chủ Streamlit đã dừng trước khi sẵn sàng")
        try:
            with urllib.request.urlopen(health_url, timeout=1) as response:
                if response.read().decode("utf-8").strip() == "ok":
                    return
        except OSError:
            pass
        time.sleep(0.2)
    raise TimeoutError("Hết thời gian chờ máy chủ Streamlit")


@pytest.fixture(scope="session")
def app_url(tmp_path_factory: pytest.TempPathFactory) -> Iterator[str]:
    database_path = tmp_path_factory.mktemp("ui-data") / "weather-ui-test.db"
    environment = os.environ.copy()
    environment["WEATHER_DB_PATH"] = str(database_path)
    project_root = Path(__file__).resolve().parents[2]
    process = subprocess.Popen(
        [
            sys.executable,
            "-m",
            "streamlit",
            "run",
            "app.py",
            "--server.port",
            str(SERVER_PORT),
            "--server.headless",
            "true",
            "--browser.gatherUsageStats",
            "false",
        ],
        cwd=project_root,
        env=environment,
        stdout=subprocess.DEVNULL,
        stderr=subprocess.STDOUT,
    )
    try:
        _wait_until_ready(process, timeout_seconds=60)
        yield SERVER_URL
    finally:
        process.terminate()
        try:
            process.wait(timeout=10)
        except subprocess.TimeoutExpired:
            process.kill()
            process.wait(timeout=10)
