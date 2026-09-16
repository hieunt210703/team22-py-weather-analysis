import sqlite3

from weather_analysis.repositories.user_repository import UserRepository


def test_find_by_username_returns_existing_user(connection: sqlite3.Connection) -> None:
    user = UserRepository(connection).find_by_username("admin")

    assert user is not None
    assert user.username == "admin"


def test_find_by_username_returns_none_for_unknown_user(
    connection: sqlite3.Connection,
) -> None:
    user = UserRepository(connection).find_by_username("khong-ton-tai")

    assert user is None
