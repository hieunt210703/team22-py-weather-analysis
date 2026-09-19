import json

import pytest
from sqlalchemy.orm import Session

from weather_analysis.repositories.system_setting_repository import (
    SystemSettingRepository,
)
from weather_analysis.services.system_settings_service import (
    FORECAST_CACHE_DURATION,
    InvalidSettingValueError,
    SettingNotFoundError,
    get_setting_value,
    list_settings,
    reset_setting,
    update_setting,
)


def test_list_settings_returns_default_without_saved_value(
    session: Session,
) -> None:
    settings = list_settings(session)

    assert len(settings) == 1
    assert settings[0].definition == FORECAST_CACHE_DURATION
    assert settings[0].value == 30
    assert settings[0].is_modified is False


def test_update_setting_saves_modified_value(session: Session) -> None:
    result = update_setting(
        session, FORECAST_CACHE_DURATION.key, 5
    )

    assert result.value == 5
    assert result.is_modified is True
    assert get_setting_value(session, FORECAST_CACHE_DURATION) == 5
    record = SystemSettingRepository(session).find_by_key(
        FORECAST_CACHE_DURATION.key
    )
    assert record is not None
    assert json.loads(record.value) == 5


def test_updating_to_default_removes_saved_value(session: Session) -> None:
    update_setting(session, FORECAST_CACHE_DURATION.key, 5)

    result = update_setting(session, FORECAST_CACHE_DURATION.key, 30)

    assert result.value == 30
    assert result.is_modified is False
    assert (
        SystemSettingRepository(session).find_by_key(
            FORECAST_CACHE_DURATION.key
        )
        is None
    )


def test_reset_setting_removes_saved_value(session: Session) -> None:
    update_setting(session, FORECAST_CACHE_DURATION.key, 5)

    result = reset_setting(session, FORECAST_CACHE_DURATION.key)

    assert result.value == 30
    assert result.is_modified is False
    assert get_setting_value(session, FORECAST_CACHE_DURATION) == 30


@pytest.mark.parametrize("operation", ["update", "reset"])
def test_unknown_key_raises_not_found(
    session: Session, operation: str
) -> None:
    with pytest.raises(SettingNotFoundError):
        if operation == "update":
            update_setting(session, "khong.ton.tai", 10)
        else:
            reset_setting(session, "khong.ton.tai")


@pytest.mark.parametrize("value", [0, 1441, True, 1.5, "10"])
def test_update_setting_rejects_invalid_value(
    session: Session, value: object
) -> None:
    with pytest.raises(InvalidSettingValueError):
        update_setting(session, FORECAST_CACHE_DURATION.key, value)


@pytest.mark.parametrize("stored_value", ["not-json", "true", "1.5", '"10"', "0"])
def test_invalid_saved_value_falls_back_to_default(
    session: Session, stored_value: str
) -> None:
    SystemSettingRepository(session).save(
        FORECAST_CACHE_DURATION.key, stored_value
    )

    settings = list_settings(session)

    assert settings[0].value == 30
    assert settings[0].is_modified is False
    assert get_setting_value(session, FORECAST_CACHE_DURATION) == 30
