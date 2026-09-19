from typing import Any

import httpx
import pytest

from weather_analysis.clients.open_meteo_client import (
    OpenMeteoClient,
    WeatherProviderError,
)


def test_fetch_forecast_sends_expected_queries_and_parses_response(
    open_meteo_payload: dict[str, Any],
) -> None:
    requests: list[httpx.Request] = []

    def handler(request: httpx.Request) -> httpx.Response:
        requests.append(request)
        key = "air_quality" if "air-quality" in request.url.host else "forecast"
        return httpx.Response(200, json=open_meteo_payload[key])

    with httpx.Client(transport=httpx.MockTransport(handler)) as http_client:
        result = OpenMeteoClient(http_client).fetch_forecast(21.0285, 105.8542)

    assert len(requests) == 2
    assert requests[0].url.params["latitude"] == "21.0285"
    assert requests[0].url.params["longitude"] == "105.8542"
    assert requests[0].url.params["forecast_days"] == "7"
    assert requests[0].url.params["timezone"] == "Asia/Ho_Chi_Minh"
    assert "temperature_2m" in requests[0].url.params["hourly"]
    assert requests[1].url.params["hourly"] == "us_aqi"
    assert result.hourly_temperature[14] == 30.4
    assert result.daily_time[0].isoformat() == "2026-09-19"
    assert result.us_aqi is not None
    assert result.us_aqi[14] == 58


def test_fetch_forecast_wraps_http_error() -> None:
    def handler(_request: httpx.Request) -> httpx.Response:
        return httpx.Response(503)

    with httpx.Client(transport=httpx.MockTransport(handler)) as http_client:
        with pytest.raises(WeatherProviderError, match="Open-Meteo"):
            OpenMeteoClient(http_client).fetch_forecast(21, 105)


def test_fetch_forecast_wraps_invalid_response() -> None:
    def handler(_request: httpx.Request) -> httpx.Response:
        return httpx.Response(200, json={"hourly": {}, "daily": {}})

    with httpx.Client(transport=httpx.MockTransport(handler)) as http_client:
        with pytest.raises(WeatherProviderError, match="Open-Meteo"):
            OpenMeteoClient(http_client).fetch_forecast(21, 105)


def test_air_quality_error_returns_forecast_without_aqi(
    open_meteo_payload: dict[str, Any],
) -> None:
    def handler(request: httpx.Request) -> httpx.Response:
        if "air-quality" in request.url.host:
            return httpx.Response(503)
        return httpx.Response(200, json=open_meteo_payload["forecast"])

    with httpx.Client(transport=httpx.MockTransport(handler)) as http_client:
        result = OpenMeteoClient(http_client).fetch_forecast(21, 105)

    assert result.us_aqi is None
