import unicodedata

from sqlalchemy.orm import Session

from weather_analysis.models import Location
from weather_analysis.repositories.location_repository import LocationRepository


def normalize_vietnamese(text: str) -> str:
    """Chuẩn hóa chữ thường và bỏ dấu tiếng Việt để tìm kiếm."""
    normalized = unicodedata.normalize("NFD", text.lower().replace("đ", "d"))
    return "".join(
        character
        for character in normalized
        if not unicodedata.combining(character)
    ).strip()


def search_locations(session: Session, query: str) -> list[Location]:
    """Tìm địa điểm theo tên hoặc vùng, không phân biệt dấu."""
    locations = LocationRepository(session).list_all()
    normalized_query = normalize_vietnamese(query)
    if not normalized_query:
        return locations
    return [
        location
        for location in locations
        if normalized_query in normalize_vietnamese(location.name)
        or normalized_query in normalize_vietnamese(location.region_label)
    ]


def get_pinned_locations(session: Session) -> list[Location]:
    """Lấy các địa điểm ghim theo thứ tự hiển thị."""
    return LocationRepository(session).list_pinned()
