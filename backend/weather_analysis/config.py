import os
from pathlib import Path


DEFAULT_DATABASE_PATH = Path(__file__).resolve().parent.parent / "data" / "weather.db"
ADMIN_USERNAME = "admin"
ADMIN_PASSWORD = "adminpw"
DEFAULT_SESSION_SECRET = "weather-analysis-development-secret"


def get_database_path() -> Path:
    """Lấy đường dẫn cơ sở dữ liệu từ môi trường hoặc dùng giá trị mặc định."""
    configured_path = os.environ.get("WEATHER_DB_PATH")
    if configured_path:
        return Path(configured_path)
    return DEFAULT_DATABASE_PATH


def get_session_secret() -> str:
    """Lấy khóa ký session từ môi trường hoặc dùng khóa dành cho phát triển."""
    configured_secret = os.environ.get("WEATHER_SESSION_SECRET")
    if configured_secret:
        return configured_secret
    # Phải đặt WEATHER_SESSION_SECRET thành một giá trị bí mật khi triển khai thật.
    return DEFAULT_SESSION_SECRET
