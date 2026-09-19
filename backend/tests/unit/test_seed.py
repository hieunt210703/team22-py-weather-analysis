from sqlalchemy import func, select
from sqlalchemy.orm import Session

from weather_analysis.models import Location, User
from weather_analysis.repositories.location_repository import LocationRepository
from weather_analysis.seed import seed_all, seed_locations


def test_seed_all_is_idempotent(session: Session) -> None:
    seed_all(session)
    seed_all(session)

    user_count = session.scalar(select(func.count()).select_from(User))
    location_count = session.scalar(select(func.count()).select_from(Location))

    assert user_count == 1
    assert location_count == 91


def test_seed_locations_does_not_replace_existing_data(session: Session) -> None:
    custom_location = Location(
        name="Địa điểm riêng",
        slug="dia-diem-rieng",
        region_code="dbbb",
        region_label="Đồng bằng Bắc Bộ",
        temp_offset=0,
        latitude=21,
        longitude=105,
        pin_order=None,
    )
    LocationRepository(session).replace_all([custom_location])

    seed_locations(session)

    locations = LocationRepository(session).list_all()
    assert [location.slug for location in locations] == ["dia-diem-rieng"]
