from httpx import Client


def test_login_and_get_current_user(client: Client) -> None:
    login_response = client.post(
        "/api/auth/login",
        json={"username": "admin", "password": "adminpw"},
    )

    assert login_response.status_code == 200
    assert login_response.json() == {"username": "admin"}

    me_response = client.get("/api/auth/me")
    assert me_response.status_code == 200
    assert me_response.json() == {"username": "admin"}


def test_login_rejects_incorrect_password(client: Client) -> None:
    response = client.post(
        "/api/auth/login",
        json={"username": "admin", "password": "sai-mat-khau"},
    )

    assert response.status_code == 401
    assert response.json() == {
        "detail": "Tên đăng nhập hoặc mật khẩu không đúng"
    }


def test_get_current_user_requires_login(client: Client) -> None:
    response = client.get("/api/auth/me")

    assert response.status_code == 401
    assert response.json() == {"detail": "Bạn cần đăng nhập"}


def test_logout_clears_session(client: Client) -> None:
    client.post(
        "/api/auth/login",
        json={"username": "admin", "password": "adminpw"},
    )

    logout_response = client.post("/api/auth/logout")
    me_response = client.get("/api/auth/me")

    assert logout_response.status_code == 204
    assert me_response.status_code == 401
