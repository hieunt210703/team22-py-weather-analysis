from fastapi import APIRouter, Depends, HTTPException, status

from weather_analysis.api.dependencies import DbSession, get_current_username
from weather_analysis.api.schemas import (
    SystemSettingResponse,
    SystemSettingUpdateRequest,
)
from weather_analysis.services.system_settings_service import (
    InvalidSettingValueError,
    SettingNotFoundError,
    list_settings,
    reset_setting,
    update_setting,
)


router = APIRouter(
    prefix="/api/admin/settings",
    tags=["admin"],
    dependencies=[Depends(get_current_username)],
)


@router.get("")
def get_system_settings(session: DbSession) -> list[SystemSettingResponse]:
    return [
        SystemSettingResponse.from_state(setting)
        for setting in list_settings(session)
    ]


@router.put("/{key}")
def put_system_setting(
    key: str,
    request: SystemSettingUpdateRequest,
    session: DbSession,
) -> SystemSettingResponse:
    try:
        setting = update_setting(session, key, request.value)
    except SettingNotFoundError as error:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Không tìm thấy cài đặt",
        ) from error
    except InvalidSettingValueError as error:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
            detail=str(error),
        ) from error
    return SystemSettingResponse.from_state(setting)


@router.delete("/{key}")
def delete_system_setting(
    key: str, session: DbSession
) -> SystemSettingResponse:
    try:
        setting = reset_setting(session, key)
    except SettingNotFoundError as error:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Không tìm thấy cài đặt",
        ) from error
    return SystemSettingResponse.from_state(setting)
