from collections.abc import Iterator
from typing import Annotated

from fastapi import Depends, HTTPException, Request, status
from sqlalchemy.orm import Session

from weather_analysis.database import session_scope


def get_session() -> Iterator[Session]:
    """Cấp một database session riêng cho mỗi request."""
    with session_scope() as session:
        yield session


def get_current_username(request: Request) -> str:
    """Đọc người dùng đã đăng nhập từ session."""
    username = request.session.get("username")
    if not isinstance(username, str):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Bạn cần đăng nhập",
        )
    return username


DbSession = Annotated[Session, Depends(get_session)]
CurrentUsername = Annotated[str, Depends(get_current_username)]
