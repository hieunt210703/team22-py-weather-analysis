import csv
import io
from pathlib import Path

from sqlalchemy.orm import Session

from weather_analysis.services.location_import_service import (
    decode_locations_csv,
    import_locations,
)


LOCATION_ALIASES_PATH = (
    Path(__file__).resolve().parent.parent.parent
    / "data"
    / "seed"
    / "location-aliases.csv"
)
ALIAS_COLUMNS = ("slug", "alias")
ALIAS_SEPARATOR = ";"


def load_location_aliases(path: Path) -> dict[str, list[str]]:
    """Đọc và nhóm các tên gọi khác theo slug địa điểm."""
    with path.open(encoding="utf-8-sig", newline="") as file:
        reader = csv.DictReader(file)
        fieldnames = reader.fieldnames or []
        missing_columns = [column for column in ALIAS_COLUMNS if column not in fieldnames]
        if missing_columns:
            columns = ", ".join(missing_columns)
            raise ValueError(f"Tệp alias thiếu cột bắt buộc: {columns}")

        aliases_by_slug: dict[str, list[str]] = {}
        seen_aliases: set[str] = set()
        for line_number, row in enumerate(reader, start=2):
            slug = (row.get("slug") or "").strip()
            alias = (row.get("alias") or "").strip()
            if not slug:
                raise ValueError(f"Dòng {line_number}: slug không được để trống")
            if not alias:
                raise ValueError(f"Dòng {line_number}: alias không được để trống")

            normalized_alias = alias.casefold()
            if normalized_alias in seen_aliases:
                raise ValueError(f"Dòng {line_number}: alias bị trùng")
            seen_aliases.add(normalized_alias)
            aliases_by_slug.setdefault(slug, []).append(alias)

    return aliases_by_slug


def merge_location_aliases(
    csv_content: str, aliases_by_slug: dict[str, list[str]]
) -> str:
    """Gắn alias vào CSV địa điểm, lấy tệp alias làm nguồn duy nhất."""
    reader = csv.DictReader(io.StringIO(csv_content, newline=""))
    fieldnames = reader.fieldnames
    if fieldnames is None:
        return csv_content

    output = io.StringIO(newline="")
    output_fieldnames = list(fieldnames)
    if "aliases" not in output_fieldnames:
        output_fieldnames.append("aliases")
    writer = csv.DictWriter(output, fieldnames=output_fieldnames, lineterminator="\n")
    writer.writeheader()

    for row in reader:
        row.pop(None, None)
        slug = (row.get("slug") or "").strip()
        row["aliases"] = ALIAS_SEPARATOR.join(aliases_by_slug.get(slug, []))
        writer.writerow(row)

    return output.getvalue()


def import_locations_with_aliases(session: Session, content: bytes) -> int:
    """Gắn alias chuẩn rồi thay toàn bộ dữ liệu địa điểm."""
    csv_content = decode_locations_csv(content)
    aliases_by_slug = load_location_aliases(LOCATION_ALIASES_PATH)
    merged_content = merge_location_aliases(csv_content, aliases_by_slug)
    return import_locations(session, merged_content.encode("utf-8"))
