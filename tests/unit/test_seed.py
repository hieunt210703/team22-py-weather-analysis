import sqlite3

from weather_analysis.seed import seed_all


def test_seed_all_is_idempotent(connection: sqlite3.Connection) -> None:
    seed_all(connection)
    seed_all(connection)

    user_count = int(connection.execute("SELECT COUNT(*) FROM users").fetchone()[0])
    city_count = int(connection.execute("SELECT COUNT(*) FROM cities").fetchone()[0])
    temperature_count = int(
        connection.execute("SELECT COUNT(*) FROM monthly_temperatures").fetchone()[0]
    )

    assert user_count == 1
    assert city_count == 2
    assert temperature_count == 24
