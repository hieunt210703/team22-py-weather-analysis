from playwright.sync_api import Locator, Page


class AdminSettingsSection:
    """Khu vực cài đặt hệ thống trên trang quản trị."""

    def __init__(self, page: Page) -> None:
        self.page = page
        self.heading = page.get_by_role("heading", name="Cài đặt hệ thống")
        self.cache_duration_input = page.get_by_label(
            "Dự báo thời tiết: Thời gian lưu cache (phút)"
        )
        self.modified_label = page.get_by_text("Đã sửa", exact=True)
        self.reset_button = page.get_by_role(
            "button",
            name="Khôi phục mặc định cho Thời gian lưu cache (phút)",
        )

    def set_cache_duration(self, value: int) -> None:
        self.cache_duration_input.fill(str(value))

    def reset_cache_duration(self) -> None:
        self.reset_button.click()

    @property
    def input(self) -> Locator:
        return self.cache_duration_input
