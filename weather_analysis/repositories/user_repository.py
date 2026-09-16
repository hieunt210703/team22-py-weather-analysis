import sqlite3

from weather_analysis.models import User


class UserRepository:
    def __init__(self, connection: sqlite3.Connection) -> None:
        self._connection = connection

    def find_by_username(self, username: str) -> User | None:
        row = self._connection.execute(
            """
            SELECT id, username, password_hash, created_at
            FROM users
            WHERE username = ?
            """,
            (username,),
        ).fetchone()
        if row is None:
            return None
        return User(
            id=int(row["id"]),
            username=str(row["username"]),
            password_hash=str(row["password_hash"]),
            created_at=str(row["created_at"]),
        )

    def insert(self, username: str, password_hash: str) -> User:
        self._connection.execute(
            "INSERT INTO users (username, password_hash) VALUES (?, ?)",
            (username, password_hash),
        )
        user = self.find_by_username(username)
        if user is None:
            raise RuntimeError("Không thể đọc người dùng vừa tạo")
        return user
