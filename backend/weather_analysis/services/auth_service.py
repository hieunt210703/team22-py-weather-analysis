import sqlite3

from weather_analysis.models import User
from weather_analysis.repositories.user_repository import UserRepository
from weather_analysis.security import verify_password


def authenticate(
    connection: sqlite3.Connection, username: str, password: str
) -> User | None:
    """Xác thực tài khoản bằng tên đăng nhập và mật khẩu."""
    user = UserRepository(connection).find_by_username(username)
    if user is None or not verify_password(password, user.password_hash):
        return None
    return user
