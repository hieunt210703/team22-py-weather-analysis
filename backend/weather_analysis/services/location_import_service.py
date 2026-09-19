import csv
import io
import math
import re

from sqlalchemy.orm import Session

from weather_analysis.models import Location
from weather_analysis.repositories.location_repository import LocationRepository


CSV_COLUMNS = (
    "name",
    "slug",
    "region_code",
    "region_label",
    "temp_offset",
    "latitude",
    "longitude",
    "pin_order",
)
MAX_REPORTED_ERRORS = 10
SLUG_PATTERN = re.compile(r"^[a-z0-9]+(?:-[a-z0-9]+)*$")


class LocationImportError(Exception):
    """Tệp dữ liệu địa điểm không hợp lệ."""

    def __init__(self, errors: list[str]) -> None:
        self.errors = errors[:MAX_REPORTED_ERRORS]
        super().__init__("\n".join(self.errors))


def _add_error(errors: list[str], message: str) -> None:
    if len(errors) < MAX_REPORTED_ERRORS:
        errors.append(message)


def _required_text(
    row: dict[str, str | None],
    column: str,
    label: str,
    max_length: int,
    line_number: int,
    errors: list[str],
) -> str:
    value = (row.get(column) or "").strip()
    if not value:
        _add_error(errors, f"Dòng {line_number}: {label} không được để trống")
    elif len(value) > max_length:
        _add_error(
            errors,
            f"Dòng {line_number}: {label} không được vượt quá {max_length} ký tự",
        )
    return value


def _finite_number(
    row: dict[str, str | None],
    column: str,
    line_number: int,
    errors: list[str],
) -> float | None:
    raw_value = (row.get(column) or "").strip()
    try:
        value = float(raw_value)
    except ValueError:
        _add_error(errors, f"Dòng {line_number}: {column} phải là một số")
        return None
    if not math.isfinite(value):
        _add_error(errors, f"Dòng {line_number}: {column} phải là một số hữu hạn")
        return None
    return value


def _pin_order(
    row: dict[str, str | None], line_number: int, errors: list[str]
) -> int | None:
    raw_value = (row.get("pin_order") or "").strip()
    if not raw_value:
        return None
    try:
        value = int(raw_value)
    except ValueError:
        _add_error(errors, f"Dòng {line_number}: pin_order phải là số nguyên từ 1")
        return None
    if value < 1:
        _add_error(errors, f"Dòng {line_number}: pin_order phải là số nguyên từ 1")
        return None
    return value


def parse_locations_csv(content: str) -> list[Location]:
    """Đọc và kiểm tra nội dung CSV trước khi tạo các model địa điểm."""
    reader = csv.DictReader(io.StringIO(content, newline=""))
    fieldnames = reader.fieldnames or []
    missing_columns = [column for column in CSV_COLUMNS if column not in fieldnames]
    if missing_columns:
        columns = ", ".join(missing_columns)
        raise LocationImportError([f"Thiếu cột bắt buộc: {columns}"])

    errors: list[str] = []
    locations: list[Location] = []
    seen_names: set[str] = set()
    seen_slugs: set[str] = set()
    seen_pin_orders: set[int] = set()

    for line_number, row in enumerate(reader, start=2):
        if len(errors) >= MAX_REPORTED_ERRORS:
            break

        name = _required_text(row, "name", "name", 100, line_number, errors)
        slug = _required_text(row, "slug", "slug", 100, line_number, errors)
        region_code = _required_text(
            row, "region_code", "region_code", 50, line_number, errors
        )
        region_label = _required_text(
            row, "region_label", "region_label", 100, line_number, errors
        )
        temp_offset = _finite_number(row, "temp_offset", line_number, errors)
        latitude = _finite_number(row, "latitude", line_number, errors)
        longitude = _finite_number(row, "longitude", line_number, errors)
        pin_order = _pin_order(row, line_number, errors)

        if slug and SLUG_PATTERN.fullmatch(slug) is None:
            _add_error(
                errors,
                f"Dòng {line_number}: slug chỉ gồm chữ thường, số và dấu gạch ngang",
            )
        if latitude is not None and not -90 <= latitude <= 90:
            _add_error(
                errors,
                f"Dòng {line_number}: latitude phải nằm trong khoảng -90 đến 90",
            )
        if longitude is not None and not -180 <= longitude <= 180:
            _add_error(
                errors,
                f"Dòng {line_number}: longitude phải nằm trong khoảng -180 đến 180",
            )

        normalized_name = name.casefold()
        if normalized_name and normalized_name in seen_names:
            _add_error(errors, f"Dòng {line_number}: name bị trùng")
        elif normalized_name:
            seen_names.add(normalized_name)

        if slug and slug in seen_slugs:
            _add_error(errors, f"Dòng {line_number}: slug bị trùng")
        elif slug:
            seen_slugs.add(slug)

        if pin_order is not None and pin_order in seen_pin_orders:
            _add_error(errors, f"Dòng {line_number}: pin_order bị trùng")
        elif pin_order is not None:
            seen_pin_orders.add(pin_order)

        if (
            name
            and slug
            and region_code
            and region_label
            and temp_offset is not None
            and latitude is not None
            and longitude is not None
        ):
            locations.append(
                Location(
                    name=name,
                    slug=slug,
                    region_code=region_code,
                    region_label=region_label,
                    temp_offset=temp_offset,
                    latitude=latitude,
                    longitude=longitude,
                    pin_order=pin_order,
                )
            )

    if not locations and not errors:
        errors.append("Tệp phải có ít nhất 1 dòng dữ liệu")
    if errors:
        raise LocationImportError(errors)
    return locations


def import_locations(session: Session, content: bytes) -> int:
    """Thay toàn bộ địa điểm bằng dữ liệu CSV hợp lệ."""
    try:
        decoded_content = content.decode("utf-8-sig")
    except UnicodeDecodeError as error:
        raise LocationImportError(["Tệp phải được mã hóa UTF-8"]) from error

    locations = parse_locations_csv(decoded_content)
    LocationRepository(session).replace_all(locations)
    return len(locations)
