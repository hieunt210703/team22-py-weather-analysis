import subprocess
import time
from collections.abc import Iterator
from contextlib import contextmanager
from pathlib import Path

import httpx


def wait_until_ready(
    url: str,
    process: subprocess.Popen[bytes],
    timeout_seconds: float = 60,
) -> None:
    """Chờ tới khi URL phản hồi hoặc báo lỗi nếu server không khởi động được."""
    deadline = time.monotonic() + timeout_seconds

    while time.monotonic() < deadline:
        exit_code = process.poll()
        if exit_code is not None:
            raise RuntimeError(
                f"Server đã dừng với mã lỗi {exit_code} trước khi sẵn sàng: {url}"
            )

        try:
            httpx.get(url, timeout=1)
            return
        except httpx.TransportError:
            time.sleep(0.5)

    raise TimeoutError(
        f"Server không phản hồi tại {url} sau {timeout_seconds:g} giây"
    )


@contextmanager
def run_server(
    command: list[str],
    cwd: Path,
    env: dict[str, str],
    ready_url: str,
) -> Iterator[None]:
    """Chạy server trong tiến trình con và dừng server khi kết thúc."""
    process = subprocess.Popen(command, cwd=cwd, env=env)
    try:
        wait_until_ready(ready_url, process)
        yield
    finally:
        if process.poll() is None:
            process.terminate()
            process.wait(timeout=10)
