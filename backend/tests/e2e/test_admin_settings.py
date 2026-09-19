from playwright.sync_api import Page, expect

from tests.e2e.pages.admin_login_page import AdminLoginPage
from tests.e2e.pages.admin_settings_section import AdminSettingsSection


def test_admin_updates_and_resets_cache_duration(
    page: Page, base_url: str
) -> None:
    login_page = AdminLoginPage(page)
    login_page.open()
    login_page.login("admin", "adminpw")
    expect(page).to_have_url(f"{base_url}/admin")

    settings = AdminSettingsSection(page)
    expect(settings.heading).to_be_visible()
    settings.set_cache_duration(5)
    expect(settings.modified_label).to_be_visible()

    page.reload()

    expect(settings.input).to_have_value("5")
    expect(settings.modified_label).to_be_visible()
    settings.reset_cache_duration()
    expect(settings.input).to_have_value("30")
    expect(settings.modified_label).to_be_hidden()
