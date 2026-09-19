from httpx import Client


HEADER = (
    "name,slug,region_code,region_label,temp_offset,latitude,longitude,pin_order\n"
)


def login(client: Client) -> None:
    response = client.post(
        "/api/auth/login",
        json={"username": "admin", "password": "adminpw"},
    )
    assert response.status_code == 200


def test_import_requires_login(client: Client) -> None:
    response = client.post(
        "/api/admin/locations/import",
        files={"file": ("locations.csv", HEADER, "text/csv")},
    )

    assert response.status_code == 401
    assert response.json() == {"detail": "Bạn cần đăng nhập"}


def test_import_replaces_locations(client: Client) -> None:
    login(client)
    content = (
        HEADER + "Địa điểm mới,dia-diem-moi,dbbb,Đồng bằng Bắc Bộ,0,21,105,1\n"
    )

    response = client.post(
        "/api/admin/locations/import",
        files={"file": ("locations.csv", content, "text/csv")},
    )

    assert response.status_code == 200
    assert response.json() == {"importedCount": 1}
    assert client.get("/api/locations").json()[0]["slug"] == "dia-diem-moi"


def test_import_adds_aliases_before_replacing_locations(client: Client) -> None:
    login(client)
    content = (
        HEADER + "Hồ Chí Minh,ho-chi-minh,dongnam,Đông Nam Bộ,0,10,106,1\n"
    )

    response = client.post(
        "/api/admin/locations/import",
        files={"file": ("locations.csv", content, "text/csv")},
    )

    assert response.status_code == 200
    search_response = client.get("/api/locations", params={"q": "HCM"})
    assert [location["slug"] for location in search_response.json()] == [
        "ho-chi-minh"
    ]


def test_import_returns_validation_detail_as_string(client: Client) -> None:
    login(client)

    response = client.post(
        "/api/admin/locations/import",
        files={"file": ("locations.csv", HEADER + "x,x,x,x,x,x,x,x\n", "text/csv")},
    )

    assert response.status_code == 422
    assert isinstance(response.json()["detail"], str)
    assert "Dòng 2" in response.json()["detail"]


def test_import_rejects_file_larger_than_one_megabyte(client: Client) -> None:
    login(client)

    response = client.post(
        "/api/admin/locations/import",
        files={"file": ("locations.csv", b"x" * (1024 * 1024 + 1), "text/csv")},
    )

    assert response.status_code == 413


def test_download_sample_file(client: Client) -> None:
    login(client)

    response = client.get("/api/admin/locations/sample")

    assert response.status_code == 200
    assert response.headers["content-type"].startswith("text/csv")
    assert "dia-diem-mau.csv" in response.headers["content-disposition"]
    assert response.text.startswith('"name","slug"')
