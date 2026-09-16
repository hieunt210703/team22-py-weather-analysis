import sqlite3

from weather_analysis.services.temperature_service import build_comparison


def test_build_comparison_returns_twelve_months_for_two_cities(
    connection: sqlite3.Connection,
) -> None:
    comparison = build_comparison(connection)

    assert comparison.months == list(range(1, 13))
    assert list(comparison.temperatures_by_city) == ["Hà Nội", "TP.HCM"]
    assert all(
        len(temperatures) == 12
        for temperatures in comparison.temperatures_by_city.values()
    )
