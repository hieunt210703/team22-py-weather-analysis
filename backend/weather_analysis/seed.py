import csv
from pathlib import Path

from sqlalchemy.orm import Session

from weather_analysis.database import create_schema, ensure_database_exists, session_scope
from weather_analysis.repositories.user_repository import UserRepository
from weather_analysis.security import hash_password


DEFAULT_USERS_PATH = Path(__file__).resolve().parent.parent / "data" / "seed" / "users.csv"


def load_users(path: Path) -> list[tuple[str, str]]:
    """Đọc danh sách tài khoản seed từ tệp CSV."""
    users: list[tuple[str, str]] = []
    with path.open(encoding="utf-8-sig", newline="") as file:
        for row in csv.DictReader(file):
            username = row.get("username")
            password = row.get("password")
            if not username or not password:
                raise ValueError("Dữ liệu seed người dùng phải có username và password")
            users.append((username, password))
    return users


def seed_all(session: Session) -> None:
    """Tạo các tài khoản mẫu theo cách lặp lại an toàn."""
    user_repository = UserRepository(session)
    for username, password in load_users(DEFAULT_USERS_PATH):
        if user_repository.find_by_username(username) is None:
            user_repository.insert(username, hash_password(password))


def main() -> None:
    """Khởi tạo schema và dữ liệu mẫu cho cơ sở dữ liệu."""
    ensure_database_exists()
    create_schema()
    with session_scope() as session:
        seed_all(session)


if __name__ == "__main__":
    main()
