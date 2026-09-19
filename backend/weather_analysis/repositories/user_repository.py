from sqlalchemy import select
from sqlalchemy.orm import Session

from weather_analysis.models import User


class UserRepository:
    def __init__(self, session: Session) -> None:
        self._session = session

    def find_by_username(self, username: str) -> User | None:
        return self._session.scalar(
            select(User).where(User.username == username)
        )

    def insert(self, username: str, password_hash: str) -> User:
        user = User(username=username, password_hash=password_hash)
        self._session.add(user)
        self._session.flush()
        return user
