from datetime import timedelta

import pytest

from weather_analysis.memory_cache import MemoryCache


def test_cache_returns_existing_value_before_expiration() -> None:
    calls = 0
    cache: MemoryCache[str, str] = MemoryCache()

    def factory() -> str:
        nonlocal calls
        calls += 1
        return "dữ liệu"

    assert cache.get_or_create("key", factory, timedelta(minutes=1)) == "dữ liệu"
    assert cache.get_or_create("key", factory, timedelta(minutes=1)) == "dữ liệu"
    assert calls == 1


def test_cache_refreshes_expired_value_with_fake_clock() -> None:
    now = 100.0
    cache: MemoryCache[str, int] = MemoryCache(lambda: now)
    calls = 0

    def factory() -> int:
        nonlocal calls
        calls += 1
        return calls

    assert cache.get_or_create("key", factory, timedelta(seconds=30)) == 1
    now = 131.0
    assert cache.get_or_create("key", factory, timedelta(seconds=30)) == 2


def test_cache_does_not_store_factory_error() -> None:
    cache: MemoryCache[str, str] = MemoryCache()
    calls = 0

    def factory() -> str:
        nonlocal calls
        calls += 1
        if calls == 1:
            raise RuntimeError("lỗi thử nghiệm")
        return "thành công"

    with pytest.raises(RuntimeError, match="lỗi thử nghiệm"):
        cache.get_or_create("key", factory, timedelta(minutes=1))

    assert cache.get_or_create("key", factory, timedelta(minutes=1)) == "thành công"
    assert calls == 2
