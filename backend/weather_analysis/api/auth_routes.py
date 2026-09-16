from fastapi import APIRouter, HTTPException, Request, Response, status

from weather_analysis.api.dependencies import CurrentUsername, DbConnection
from weather_analysis.api.schemas import LoginRequest, UserResponse
from weather_analysis.services.auth_service import authenticate


router = APIRouter(prefix="/api/auth", tags=["auth"])


@router.post("/login")
def login(
    credentials: LoginRequest,
    request: Request,
    connection: DbConnection,
) -> UserResponse:
    user = authenticate(connection, credentials.username, credentials.password)
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Tên đăng nhập hoặc mật khẩu không đúng",
        )

    request.session["username"] = user.username
    return UserResponse(username=user.username)


@router.post("/logout", status_code=status.HTTP_204_NO_CONTENT)
def logout(request: Request) -> Response:
    request.session.clear()
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@router.get("/me")
def get_me(username: CurrentUsername) -> UserResponse:
    return UserResponse(username=username)
