from playwright.sync_api import Page


class AdminLoginPage:
    """Trang đăng nhập khu vực quản trị."""

    PATH = "/admin/dang-nhap"

    def __init__(self, page: Page) -> None:
        self.page = page
        self.username_input = page.get_by_label("Tên đăng nhập")
        self.password_input = page.get_by_label("Mật khẩu")
        self.submit_button = page.get_by_role(
            "button", name="Đăng nhập", exact=True
        )
        self.error_message = page.get_by_role("alert")

    def open(self) -> None:
        """Mở trang đăng nhập."""
        self.page.goto(self.PATH)

    def login(self, username: str, password: str) -> None:
        """Nhập thông tin đăng nhập và gửi form."""
        self.username_input.fill(username)
        self.password_input.fill(password)
        self.submit_button.click()
