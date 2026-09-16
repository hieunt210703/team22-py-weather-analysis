from pydantic import BaseModel


class LoginRequest(BaseModel):
    username: str
    password: str


class UserResponse(BaseModel):
    username: str


class CityTemperatures(BaseModel):
    name: str
    temperatures: list[float]


class TemperatureComparisonResponse(BaseModel):
    months: list[int]
    cities: list[CityTemperatures]
