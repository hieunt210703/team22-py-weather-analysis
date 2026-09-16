import sqlite3
from collections.abc import Iterator
from typing import Annotated

from fastapi import Depends, HTTPException, Request, status

from weather_analysis.database import connection_scope


def get_connection() -> Iterator[sqlite3.Connection]:
    """Cấp một kết nối cơ sở dữ liệu riêng cho mỗi request."""
    with connection_scope() as connection:
        yield connection


def get_current_username(request: Request) -> str:
    """Đọc người dùng đã đăng nhập từ session."""
    username = request.session.get("username")
    if not isinstance(username, str):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Bạn cần đăng nhập",
        )
    return username


DbConnection = Annotated[sqlite3.Connection, Depends(get_connection)]
CurrentUsername = Annotated[str, Depends(get_current_username)]
