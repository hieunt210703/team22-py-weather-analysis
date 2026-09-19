from httpx import Client

from weather_analysis.api.app import app
from weather_analysis.api.dependencies import (
    get_forecast_cache,
    get_open_meteo_client,
)
from weather_analysis.clients.open_meteo_client import (
    OpenMeteoClient,
    OpenMeteoForecast,
    WeatherProviderError,
)
from weather_analysis.memory_cache import MemoryCache
from weather_analysis.services.forecast_service import ForecastCacheKey


class FakeOpenMeteoClient(OpenMeteoClient):
    def __init__(
        self,
        result: OpenMeteoForecast,
        error: WeatherProviderError | None = None,
    ) -> None:
        self.result = result
        self.error = error

    def fetch_forecast(
        self,
        latitude: float,
        longitude: float,
    ) -> OpenMeteoForecast:
        del latitude, longitude
        if self.error is not None:
            raise self.error
        return self.result


def override_dependencies(fake_client: FakeOpenMeteoClient) -> None:
    cache: MemoryCache[ForecastCacheKey, OpenMeteoForecast] = MemoryCache()
    app.dependency_overrides[get_open_meteo_client] = lambda: fake_client
    app.dependency_overrides[get_forecast_cache] = lambda: cache


def test_forecast_returns_camel_case_response(
    client: Client,
    raw_forecast: OpenMeteoForecast,
) -> None:
    override_dependencies(FakeOpenMeteoClient(raw_forecast))
    try:
        response = client.get("/api/locations/ha-noi/forecast")
    finally:
        app.dependency_overrides.clear()

    assert response.status_code == 200
    body = response.json()
    assert body["location"]["slug"] == "ha-noi"
    assert "updatedAt" in body
    assert "currentHour" not in body
    assert len(body["hourly"]) == 24
    assert body["hourly"][14]["rainProb"] == 60
    assert body["details"]["aqi"] is not None
    assert body["daily7"][1]["dayLabel"] == "Chủ Nhật"


def test_forecast_returns_404_for_unknown_slug(
    client: Client,
    raw_forecast: OpenMeteoForecast,
) -> None:
    override_dependencies(FakeOpenMeteoClient(raw_forecast))
    try:
        response = client.get("/api/locations/khong-ton-tai/forecast")
    finally:
        app.dependency_overrides.clear()

    assert response.status_code == 404
    assert response.json() == {"detail": "Không tìm thấy địa điểm"}


def test_forecast_returns_502_for_provider_error(
    client: Client,
    raw_forecast: OpenMeteoForecast,
) -> None:
    error = WeatherProviderError("Không lấy được dữ liệu dự báo từ Open-Meteo")
    override_dependencies(FakeOpenMeteoClient(raw_forecast, error))
    try:
        response = client.get("/api/locations/ha-noi/forecast")
    finally:
        app.dependency_overrides.clear()

    assert response.status_code == 502
    assert response.json() == {
        "detail": "Không lấy được dữ liệu dự báo từ Open-Meteo"
    }
