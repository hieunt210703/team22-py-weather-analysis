from fastapi import APIRouter

from weather_analysis.api.dependencies import DbSession
from weather_analysis.api.schemas import LocationResponse
from weather_analysis.services.location_service import (
    get_pinned_locations,
    search_locations,
)


router = APIRouter(prefix="/api/locations", tags=["locations"])


@router.get("")
def list_locations(session: DbSession, q: str = "") -> list[LocationResponse]:
    return [
        LocationResponse.from_model(location)
        for location in search_locations(session, q)
    ]


@router.get("/pinned")
def list_pinned_locations(session: DbSession) -> list[LocationResponse]:
    return [
        LocationResponse.from_model(location)
        for location in get_pinned_locations(session)
    ]
