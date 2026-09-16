import os
from pathlib import Path


DEFAULT_DATABASE_PATH = Path("data/weather.db")
ADMIN_USERNAME = "admin"
ADMIN_PASSWORD = "adminpw"


def get_database_path() -> Path:
    """Lấy đường dẫn cơ sở dữ liệu từ môi trường hoặc dùng giá trị mặc định."""
    configured_path = os.environ.get("WEATHER_DB_PATH")
    if configured_path:
        return Path(configured_path)
    return DEFAULT_DATABASE_PATH
