import sqlite3

from weather_analysis.config import ADMIN_PASSWORD, ADMIN_USERNAME
from weather_analysis.repositories.user_repository import UserRepository
from weather_analysis.security import hash_password


CITY_TEMPERATURES: dict[str, tuple[float, ...]] = {
    "Hà Nội": (16.4, 17.2, 20.1, 24.2, 27.6, 29.3, 29.2, 28.6, 27.5, 24.9, 21.5, 18.2),
    "TP.HCM": (26.0, 26.8, 28.0, 29.1, 28.8, 27.8, 27.5, 27.4, 27.3, 27.2, 27.0, 26.2),
}


def seed_all(connection: sqlite3.Connection) -> None:
    """Tạo tài khoản quản trị và dữ liệu nhiệt độ mẫu theo cách lặp lại an toàn."""
    user_repository = UserRepository(connection)
    if user_repository.find_by_username(ADMIN_USERNAME) is None:
        user_repository.insert(ADMIN_USERNAME, hash_password(ADMIN_PASSWORD))

    for city_name, temperatures in CITY_TEMPERATURES.items():
        connection.execute(
            "INSERT INTO cities (name) VALUES (?) ON CONFLICT(name) DO NOTHING",
            (city_name,),
        )
        city_row = connection.execute(
            "SELECT id FROM cities WHERE name = ?", (city_name,)
        ).fetchone()
        if city_row is None:
            raise RuntimeError("Không thể đọc thành phố vừa tạo")
        city_id = int(city_row["id"])
        connection.executemany(
            """
            INSERT INTO monthly_temperatures (city_id, month, avg_temperature)
            VALUES (?, ?, ?)
            ON CONFLICT(city_id, month) DO NOTHING
            """,
            [
                (city_id, month, temperature)
                for month, temperature in enumerate(temperatures, start=1)
            ],
        )
