from typing import TypedDict, cast

from httpx import Client


class CityResponse(TypedDict):
    name: str
    temperatures: list[float]


class ComparisonResponse(TypedDict):
    months: list[int]
    cities: list[CityResponse]


def test_temperature_comparison_requires_login(client: Client) -> None:
    response = client.get("/api/temperatures/comparison")

    assert response.status_code == 401


def test_temperature_comparison_returns_seeded_data(client: Client) -> None:
    client.post(
        "/api/auth/login",
        json={"username": "admin", "password": "adminpw"},
    )

    response = client.get("/api/temperatures/comparison")
    body = cast(ComparisonResponse, response.json())

    assert response.status_code == 200
    assert body["months"] == list(range(1, 13))
    assert [city["name"] for city in body["cities"]] == ["Hà Nội", "TP.HCM"]
    assert all(len(city["temperatures"]) == 12 for city in body["cities"])
