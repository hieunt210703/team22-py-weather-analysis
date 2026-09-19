from sqlalchemy.orm import Session

from weather_analysis.services.location_service import (
    normalize_vietnamese,
    search_locations,
)


def test_normalize_vietnamese_removes_marks_and_letter_d() -> None:
    assert normalize_vietnamese("Đà Nẵng") == "da nang"


def test_search_locations_matches_name_without_marks(session: Session) -> None:
    locations = search_locations(session, "da nang")

    assert [location.slug for location in locations] == ["da-nang"]


def test_search_locations_matches_region_without_marks(session: Session) -> None:
    locations = search_locations(session, "tay nguyen")

    assert locations
    assert {location.region_code for location in locations} == {"taynguyen"}


def test_search_locations_returns_all_for_blank_query(session: Session) -> None:
    assert len(search_locations(session, "  ")) == 91


def test_search_locations_returns_empty_for_unknown_query(session: Session) -> None:
    assert search_locations(session, "khong-co-dia-diem") == []
