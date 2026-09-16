from fastapi import APIRouter, Depends

from weather_analysis.api.dependencies import (
    DbConnection,
    get_current_username,
)
from weather_analysis.api.schemas import (
    CityTemperatures,
    TemperatureComparisonResponse,
)
from weather_analysis.services.temperature_service import build_comparison


router = APIRouter(
    prefix="/api/temperatures",
    tags=["temperatures"],
    dependencies=[Depends(get_current_username)],
)


@router.get("/comparison")
def get_temperature_comparison(
    connection: DbConnection,
) -> TemperatureComparisonResponse:
    comparison = build_comparison(connection)
    cities = [
        CityTemperatures(name=name, temperatures=temperatures)
        for name, temperatures in comparison.temperatures_by_city.items()
    ]
    return TemperatureComparisonResponse(months=comparison.months, cities=cities)
