from datetime import datetime

from sqlalchemy import String, Unicode, func
from sqlalchemy.orm import Mapped, mapped_column

from weather_analysis.database import Base


class User(Base):
    """Tài khoản có thể đăng nhập vào ứng dụng."""

    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True)
    username: Mapped[str] = mapped_column(Unicode(100), unique=True)
    password_hash: Mapped[str] = mapped_column(String(200))
    created_at: Mapped[datetime] = mapped_column(server_default=func.sysutcdatetime())
