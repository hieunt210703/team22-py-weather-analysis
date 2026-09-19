from pathlib import Path

import pytest

from weather_analysis.services.location_alias_service import (
    LOCATION_ALIASES_PATH,
    load_location_aliases,
    merge_location_aliases,
)
from weather_analysis.services.location_import_service import parse_locations_csv


def test_load_location_aliases_groups_aliases_by_slug(tmp_path: Path) -> None:
    path = tmp_path / "aliases.csv"
    path.write_text(
        "slug,alias\nho-chi-minh,HCM\nho-chi-minh,Sài Gòn\nha-noi,HN\n",
        encoding="utf-8",
    )

    assert load_location_aliases(path) == {
        "ho-chi-minh": ["HCM", "Sài Gòn"],
        "ha-noi": ["HN"],
    }


@pytest.mark.parametrize(
    ("content", "message"),
    [
        ("slug\nho-chi-minh\n", "thiếu cột bắt buộc: alias"),
        ("slug,alias\nho-chi-minh,\n", "alias không được để trống"),
        ("slug,alias\na,HCM\nb,hcm\n", "alias bị trùng"),
    ],
)
def test_load_location_aliases_rejects_invalid_data(
    tmp_path: Path, content: str, message: str
) -> None:
    path = tmp_path / "aliases.csv"
    path.write_text(content, encoding="utf-8")

    with pytest.raises(ValueError, match=message):
        load_location_aliases(path)


def test_merge_location_aliases_adds_and_overwrites_alias_column() -> None:
    content = (
        "name,slug,aliases\n"
        "Hồ Chí Minh,ho-chi-minh,alias upload\n"
        "Địa điểm khác,dia-diem-khac,alias upload\n"
    )

    merged = merge_location_aliases(
        content,
        {"ho-chi-minh": ["HCM", "Sài Gòn"], "slug-khong-co": ["Bỏ qua"]},
    )

    assert "HCM;Sài Gòn" in merged
    assert "alias upload" not in merged
    assert "slug-khong-co" not in merged


def test_all_alias_slugs_exist_in_sample_locations() -> None:
    location_path = LOCATION_ALIASES_PATH.with_name("locations.csv")
    location_slugs = {
        location.slug
        for location in parse_locations_csv(location_path.read_text(encoding="utf-8-sig"))
    }

    assert set(load_location_aliases(LOCATION_ALIASES_PATH)) <= location_slugs
