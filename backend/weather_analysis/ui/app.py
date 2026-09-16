import streamlit as st

from weather_analysis.database import connection_scope, create_schema
from weather_analysis.seed import seed_all
from weather_analysis.ui import dashboard_view, login_view


def run() -> None:
    """Khởi tạo dữ liệu và hiển thị màn hình phù hợp với phiên đăng nhập."""
    st.set_page_config(page_title="Phân tích thời tiết", page_icon="🌤️")

    with connection_scope() as connection:
        create_schema(connection)
        seed_all(connection)

    if st.session_state.get("username") is None:
        login_view.render()
    else:
        dashboard_view.render()
