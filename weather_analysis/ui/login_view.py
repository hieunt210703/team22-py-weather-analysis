import streamlit as st

from weather_analysis.database import connection_scope
from weather_analysis.services.auth_service import authenticate


def render() -> None:
    """Hiển thị biểu mẫu đăng nhập."""
    st.title("Phân tích dữ liệu thời tiết")
    st.subheader("Đăng nhập")

    with st.form("login_form"):
        username = st.text_input("Tên đăng nhập")
        password = st.text_input("Mật khẩu", type="password")
        submitted = st.form_submit_button("Đăng nhập")

    if not submitted:
        return

    with connection_scope() as connection:
        user = authenticate(connection, username, password)

    if user is None:
        st.error("Tên đăng nhập hoặc mật khẩu không đúng")
        return

    st.session_state["username"] = user.username
    st.rerun()
