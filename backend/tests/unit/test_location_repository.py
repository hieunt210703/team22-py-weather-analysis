from sqlalchemy.orm import Session

from weather_analysis.models import Location
from weather_analysis.repositories.location_repository import LocationRepository


def make_location(name: str, slug: str, pin_order: int | None = None) -> Location:
    return Location(
        name=name,
        slug=slug,
        region_code="dbbb",
        region_label="Đồng bằng Bắc Bộ",
        temp_offset=0,
        latitude=21,
        longitude=105,
        pin_order=pin_order,
    )


def test_replace_all_removes_old_locations(session: Session) -> None:
    repository = LocationRepository(session)

    repository.replace_all([make_location("Địa điểm mới", "dia-diem-moi")])

    assert repository.count() == 1
    assert repository.list_all()[0].slug == "dia-diem-moi"


def test_list_all_uses_vietnamese_name_order(session: Session) -> None:
    repository = LocationRepository(session)
    repository.replace_all(
        [
            make_location("Hà Nội", "ha-noi"),
            make_location("Đà Nẵng", "da-nang"),
            make_location("Cần Thơ", "can-tho"),
        ]
    )

    assert [location.name for location in repository.list_all()] == [
        "Cần Thơ",
        "Đà Nẵng",
        "Hà Nội",
    ]


def test_list_pinned_uses_pin_order(session: Session) -> None:
    repository = LocationRepository(session)
    repository.replace_all(
        [
            make_location("Hà Nội", "ha-noi", 2),
            make_location("Hồ Chí Minh", "ho-chi-minh", 1),
            make_location("Cần Thơ", "can-tho"),
        ]
    )

    assert [location.slug for location in repository.list_pinned()] == [
        "ho-chi-minh",
        "ha-noi",
    ]
