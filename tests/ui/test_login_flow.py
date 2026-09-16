import pytest
from playwright.sync_api import Page, expect


pytestmark = pytest.mark.ui


def test_login_error_successful_login_and_logout(page: Page, app_url: str) -> None:
    page.goto(app_url)

    page.get_by_label("Tên đăng nhập").fill("admin")
    page.get_by_label("Mật khẩu").fill("sai-mat-khau")
    page.get_by_role("button", name="Đăng nhập").click()
    expect(page.get_by_text("Tên đăng nhập hoặc mật khẩu không đúng")).to_be_visible()

    page.get_by_label("Mật khẩu").fill("adminpw")
    page.get_by_role("button", name="Đăng nhập").click()
    expect(page.get_by_role("heading", name="So sánh nhiệt độ trung bình theo tháng")).to_be_visible()
    expect(page.locator('[data-testid="stVegaLiteChart"]')).to_be_visible()

    page.get_by_role("button", name="Đăng xuất").click()
    expect(page.get_by_role("heading", name="Đăng nhập")).to_be_visible()
