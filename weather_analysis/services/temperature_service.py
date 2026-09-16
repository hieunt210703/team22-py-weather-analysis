import sqlite3

from weather_analysis.models import TemperatureComparison
from weather_analysis.repositories.temperature_repository import TemperatureRepository


def build_comparison(connection: sqlite3.Connection) -> TemperatureComparison:
    """Tạo dữ liệu so sánh nhiệt độ theo tháng cho các thành phố."""
    repository = TemperatureRepository(connection)
    temperatures_by_city: dict[str, list[float]] = {}
    months: list[int] = []

    for city in repository.list_cities():
        temperatures = repository.list_monthly_temperatures(city.id)
        city_months = [temperature.month for temperature in temperatures]
        if not months:
            months = city_months
        elif city_months != months:
            raise ValueError("Dữ liệu các thành phố không có cùng tập tháng")
        temperatures_by_city[city.name] = [
            temperature.avg_temperature for temperature in temperatures
        ]

    return TemperatureComparison(
        months=months,
        temperatures_by_city=temperatures_by_city,
    )
