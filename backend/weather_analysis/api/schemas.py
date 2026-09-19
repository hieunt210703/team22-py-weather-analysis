from typing import Self

from pydantic import BaseModel, ConfigDict
from pydantic.alias_generators import to_camel

from weather_analysis.models import Location


class LoginRequest(BaseModel):
    username: str
    password: str


class UserResponse(BaseModel):
    username: str


class LocationResponse(BaseModel):
    model_config = ConfigDict(alias_generator=to_camel, validate_by_name=True)

    name: str
    slug: str
    region: str
    region_label: str
    temp_offset: float
    lat: float
    lon: float

    @classmethod
    def from_model(cls, location: Location) -> Self:
        return cls(
            name=location.name,
            slug=location.slug,
            region=location.region_code,
            region_label=location.region_label,
            temp_offset=location.temp_offset,
            lat=location.latitude,
            lon=location.longitude,
        )


class LocationImportResponse(BaseModel):
    model_config = ConfigDict(alias_generator=to_camel, validate_by_name=True)

    imported_count: int
