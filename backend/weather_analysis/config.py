import os
from pathlib import Path

import pyodbc
from sqlalchemy.engine import URL


DEFAULT_DATABASE_NAME = "WeatherAnalysis"
DEFAULT_LOCALDB_INSTANCE = r"(localdb)\MSSQLLocalDB"
DEFAULT_DATA_DIRECTORY = Path(__file__).resolve().parent.parent / "data"
DEFAULT_SESSION_SECRET = "weather-analysis-development-secret"


def get_data_directory() -> Path:
    """Lấy thư mục lưu tệp dữ liệu LocalDB."""
    configured_directory = os.environ.get("WEATHER_DB_DIR")
    if configured_directory:
        return Path(configured_directory)
    return DEFAULT_DATA_DIRECTORY


def get_database_name() -> str:
    """Lấy tên cơ sở dữ liệu từ môi trường."""
    return os.environ.get("WEATHER_DB_NAME", DEFAULT_DATABASE_NAME)


def get_database_file_path() -> Path:
    """Lấy đường dẫn tệp dữ liệu chính của LocalDB."""
    return get_data_directory() / f"{get_database_name()}.mdf"


def find_sql_server_driver() -> str:
    """Chọn ODBC driver SQL Server mới nhất đang có trên máy."""
    installed_drivers = set(pyodbc.drivers())
    preferred_drivers = (
        "ODBC Driver 18 for SQL Server",
        "ODBC Driver 17 for SQL Server",
        "SQL Server",
    )
    for driver in preferred_drivers:
        if driver in installed_drivers:
            return driver
    raise RuntimeError("Không tìm thấy ODBC driver dành cho SQL Server")


def build_localdb_url(database_name: str) -> str:
    """Tạo URL SQLAlchemy kết nối tới SQL Server LocalDB."""
    url = URL.create(
        "mssql+pyodbc",
        host=DEFAULT_LOCALDB_INSTANCE,
        database=database_name,
        query={
            "driver": find_sql_server_driver(),
            "TrustServerCertificate": "yes",
        },
    )
    return url.render_as_string(hide_password=False)


def get_database_url() -> str:
    """Lấy URL cơ sở dữ liệu hoặc tạo URL LocalDB mặc định."""
    configured_url = os.environ.get("WEATHER_DB_URL")
    if configured_url:
        return configured_url
    return build_localdb_url(get_database_name())


def get_session_secret() -> str:
    """Lấy khóa ký session từ môi trường hoặc dùng khóa dành cho phát triển."""
    configured_secret = os.environ.get("WEATHER_SESSION_SECRET")
    if configured_secret:
        return configured_secret
    # Phải đặt WEATHER_SESSION_SECRET thành một giá trị bí mật khi triển khai thật.
    return DEFAULT_SESSION_SECRET
