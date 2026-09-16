import sqlite3

from weather_analysis.models import City, MonthlyTemperature


class TemperatureRepository:
    def __init__(self, connection: sqlite3.Connection) -> None:
        self._connection = connection

    def list_cities(self) -> list[City]:
        rows = self._connection.execute(
            "SELECT id, name FROM cities ORDER BY id"
        ).fetchall()
        return [City(id=int(row["id"]), name=str(row["name"])) for row in rows]

    def list_monthly_temperatures(self, city_id: int) -> list[MonthlyTemperature]:
        rows = self._connection.execute(
            """
            SELECT city_id, month, avg_temperature
            FROM monthly_temperatures
            WHERE city_id = ?
            ORDER BY month
            """,
            (city_id,),
        ).fetchall()
        return [
            MonthlyTemperature(
                city_id=int(row["city_id"]),
                month=int(row["month"]),
                avg_temperature=float(row["avg_temperature"]),
            )
            for row in rows
        ]
