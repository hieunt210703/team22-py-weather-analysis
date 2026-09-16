from dataclasses import dataclass


@dataclass(frozen=True)
class User:
    id: int
    username: str
    password_hash: str
    created_at: str


@dataclass(frozen=True)
class City:
    id: int
    name: str


@dataclass(frozen=True)
class MonthlyTemperature:
    city_id: int
    month: int
    avg_temperature: float


@dataclass(frozen=True)
class TemperatureComparison:
    months: list[int]
    temperatures_by_city: dict[str, list[float]]
