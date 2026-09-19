from pathlib import Path

from fastapi import APIRouter, Depends, HTTPException, UploadFile, status
from fastapi.responses import FileResponse

from weather_analysis.api.dependencies import DbSession, get_current_username
from weather_analysis.api.schemas import LocationImportResponse
from weather_analysis.seed import LOCATIONS_SEED_PATH
from weather_analysis.services.location_alias_service import (
    import_locations_with_aliases,
)
from weather_analysis.services.location_import_service import LocationImportError


MAX_UPLOAD_BYTES = 1024 * 1024
router = APIRouter(
    prefix="/api/admin/locations",
    tags=["admin"],
    dependencies=[Depends(get_current_username)],
)


@router.post("/import")
def import_locations_file(
    file: UploadFile, session: DbSession
) -> LocationImportResponse:
    content = file.file.read(MAX_UPLOAD_BYTES + 1)
    if len(content) > MAX_UPLOAD_BYTES:
        raise HTTPException(
            status_code=status.HTTP_413_CONTENT_TOO_LARGE,
            detail="Tệp vượt quá dung lượng cho phép (1 MB)",
        )

    try:
        imported_count = import_locations_with_aliases(session, content)
    except LocationImportError as error:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
            detail="\n".join(error.errors),
        ) from error
    return LocationImportResponse(imported_count=imported_count)


@router.get("/sample", response_class=FileResponse)
def download_sample_file() -> FileResponse:
    return FileResponse(
        path=Path(LOCATIONS_SEED_PATH),
        media_type="text/csv",
        filename="dia-diem-mau.csv",
    )
