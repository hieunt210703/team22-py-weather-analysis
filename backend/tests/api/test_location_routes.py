from httpx import Client


def test_list_locations_returns_camel_case_fields(client: Client) -> None:
    response = client.get("/api/locations?q=da%20nang")

    assert response.status_code == 200
    assert response.json() == [
        {
            "name": "Đà Nẵng",
            "slug": "da-nang",
            "region": "trungtrung",
            "regionLabel": "Trung Trung Bộ",
            "tempOffset": 0.0,
            "lat": 16.0544,
            "lon": 108.2022,
        }
    ]


def test_list_locations_returns_all_for_blank_query(client: Client) -> None:
    response = client.get("/api/locations?q=")

    assert response.status_code == 200
    assert len(response.json()) == 91


def test_list_pinned_locations_returns_configured_order(client: Client) -> None:
    response = client.get("/api/locations/pinned")

    assert response.status_code == 200
    assert [location["name"] for location in response.json()] == [
        "Hồ Chí Minh",
        "Hà Nội",
        "Đà Nẵng",
        "Đà Lạt",
        "Nha Trang",
        "Huế",
    ]
