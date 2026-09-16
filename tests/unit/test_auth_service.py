import sqlite3

from weather_analysis.services.auth_service import authenticate


def test_authenticate_returns_user_for_correct_credentials(
    connection: sqlite3.Connection,
) -> None:
    user = authenticate(connection, "admin", "adminpw")

    assert user is not None
    assert user.username == "admin"


def test_authenticate_rejects_incorrect_password(connection: sqlite3.Connection) -> None:
    assert authenticate(connection, "admin", "sai-mat-khau") is None


def test_authenticate_rejects_unknown_user(connection: sqlite3.Connection) -> None:
    assert authenticate(connection, "khong-ton-tai", "adminpw") is None
