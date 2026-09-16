from collections.abc import Mapping, Sequence
from typing import Protocol, cast

import streamlit as st

from weather_analysis.database import connection_scope
from weather_analysis.services.temperature_service import build_comparison


class _LineChart(Protocol):
    def __call__(
        self,
        data: Mapping[str, Sequence[int | float]],
        *,
        x: str,
        y: Sequence[str],
    ) -> object: ...


def render() -> None:
    """Hiển thị biểu đồ so sánh nhiệt độ và thao tác đăng xuất."""
    st.title("So sánh nhiệt độ trung bình theo tháng")
    st.write(f"Xin chào, {st.session_state['username']}!")

    with connection_scope() as connection:
        comparison = build_comparison(connection)

    chart_data: dict[str, list[int] | list[float]] = {
        "Tháng": comparison.months,
        **comparison.temperatures_by_city,
    }
    city_names = list(comparison.temperatures_by_city)
    line_chart = cast(_LineChart, getattr(st, "line_chart"))
    line_chart(chart_data, x="Tháng", y=city_names)

    if st.button("Đăng xuất"):
        del st.session_state["username"]
        st.rerun()
