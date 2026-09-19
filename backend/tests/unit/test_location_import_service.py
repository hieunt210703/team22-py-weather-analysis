import pytest
from sqlalchemy.orm import Session

from weather_analysis.repositories.location_repository import LocationRepository
from weather_analysis.services.location_import_service import (
    LocationImportError,
    decode_locations_csv,
    import_locations,
    parse_locations_csv,
)


HEADER = (
    "name,slug,region_code,region_label,temp_offset,latitude,longitude,pin_order\n"
)


def test_parse_locations_csv_accepts_valid_data() -> None:
    locations = parse_locations_csv(
        HEADER + "Hà Nội,ha-noi,dbbb,Đồng bằng Bắc Bộ,0,21.0285,105.8542,2\n"
    )

    assert len(locations) == 1
    assert locations[0].region_code == "dbbb"
    assert locations[0].pin_order == 2


def test_parse_locations_csv_reads_optional_aliases() -> None:
    content = (
        HEADER.removesuffix("\n")
        + ",aliases\n"
        + "Hồ Chí Minh,ho-chi-minh,dongnam,Đông Nam Bộ,0,10,106,1,"
        + '"HCM;Sài Gòn"\n'
    )

    locations = parse_locations_csv(content)

    assert locations[0].aliases == "HCM;Sài Gòn"


def test_parse_locations_csv_rejects_missing_column() -> None:
    with pytest.raises(LocationImportError, match="Thiếu cột bắt buộc: pin_order"):
        parse_locations_csv(HEADER.removesuffix(",pin_order\n"))


def test_parse_locations_csv_reports_line_for_invalid_numbers() -> None:
    with pytest.raises(LocationImportError) as error:
        parse_locations_csv(
            HEADER + "Hà Nội,ha-noi,dbbb,Đồng bằng Bắc Bộ,x,91,181,0\n"
        )

    assert error.value.errors == [
        "Dòng 2: temp_offset phải là một số",
        "Dòng 2: pin_order phải là số nguyên từ 1",
        "Dòng 2: latitude phải nằm trong khoảng -90 đến 90",
        "Dòng 2: longitude phải nằm trong khoảng -180 đến 180",
    ]


def test_parse_locations_csv_rejects_duplicates() -> None:
    content = HEADER + "\n".join(
        [
            "Hà Nội,ha-noi,dbbb,Đồng bằng Bắc Bộ,0,21,105,1",
            "hà nội,ha-noi,dbbb,Đồng bằng Bắc Bộ,0,21,105,1",
        ]
    )

    with pytest.raises(LocationImportError) as error:
        parse_locations_csv(content)

    assert error.value.errors == [
        "Dòng 3: name bị trùng",
        "Dòng 3: slug bị trùng",
        "Dòng 3: pin_order bị trùng",
    ]


def test_parse_locations_csv_rejects_empty_file() -> None:
    with pytest.raises(LocationImportError, match="ít nhất 1 dòng"):
        parse_locations_csv(HEADER)


def test_import_locations_rejects_non_utf8_content(session: Session) -> None:
    with pytest.raises(LocationImportError, match="UTF-8"):
        import_locations(session, b"\xff\xfe")


def test_decode_locations_csv_accepts_utf8_bom() -> None:
    assert decode_locations_csv(b"\xef\xbb\xbfname") == "name"


def test_import_locations_replaces_old_data(session: Session) -> None:
    content = (
        HEADER + "Địa điểm mới,dia-diem-moi,dbbb,Đồng bằng Bắc Bộ,0,21,105,\n"
    )

    imported_count = import_locations(session, content.encode())

    assert imported_count == 1
    assert [location.slug for location in LocationRepository(session).list_all()] == [
        "dia-diem-moi"
    ]
