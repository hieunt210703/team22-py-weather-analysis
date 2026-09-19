import pytest
from playwright.sync_api import Page, expect

from tests.e2e.pages.admin_login_page import AdminLoginPage


def test_admin_logs_in_with_correct_credentials(
    page: Page, base_url: str
) -> None:
    login_page = AdminLoginPage(page)

    login_page.open()
    login_page.login("admin", "adminpw")

    expect(page).to_have_url(f"{base_url}/admin")
    expect(page.get_by_role("heading", name="Xin chào, admin")).to_be_visible()


@pytest.mark.parametrize(
    ("username", "password"),
    [("admin", "sai-mat-khau"), ("khong-ton-tai", "adminpw")],
    ids=["sai-mat-khau", "sai-ten-dang-nhap"],
)
def test_login_shows_error_for_incorrect_credentials(
    page: Page,
    base_url: str,
    username: str,
    password: str,
) -> None:
    login_page = AdminLoginPage(page)

    login_page.open()
    login_page.login(username, password)

    expect(login_page.error_message).to_have_text(
        "Tên đăng nhập hoặc mật khẩu không đúng"
    )
    expect(page).to_have_url(f"{base_url}/admin/dang-nhap")
