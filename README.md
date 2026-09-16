# Phân tích dữ liệu thời tiết

Ứng dụng minh họa luồng giao diện → nghiệp vụ → cơ sở dữ liệu bằng Python, Streamlit và SQLite. Sau khi đăng nhập, ứng dụng hiển thị biểu đồ so sánh nhiệt độ trung bình 12 tháng của Hà Nội và TP.HCM.

## Yêu cầu

- Python 3.14
- Windows PowerShell

## Cài đặt

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install -r requirements-dev.txt
```

## Chạy ứng dụng

```powershell
streamlit run app.py
```

Mở địa chỉ Streamlit hiển thị trong terminal và đăng nhập bằng:

- Tên đăng nhập: `admin`
- Mật khẩu: `adminpw`

Cơ sở dữ liệu được tạo tự động tại `data/weather.db`. Có thể đặt biến môi trường `WEATHER_DB_PATH` để dùng một tệp SQLite khác.

## Chạy kiểm tra

Kiểm tra kiểu dữ liệu và định dạng mã nguồn:

```powershell
pyright
ruff check .
```

Chạy unit test:

```powershell
pytest tests/unit -q
```

UI test cần trình duyệt Chromium của Playwright:

```powershell
python -m playwright install chromium
pytest tests/ui -q
```

Có thể chạy toàn bộ test không gồm UI test bằng:

```powershell
pytest -m "not ui"
```

## Cấu trúc chính

- `weather_analysis/ui/`: giao diện Streamlit.
- `weather_analysis/services/`: nghiệp vụ xác thực và tổng hợp dữ liệu biểu đồ.
- `weather_analysis/repositories/`: truy vấn SQLite.
- `tests/unit/`: kiểm thử tự động cho nghiệp vụ và dữ liệu.
- `tests/ui/`: kiểm thử luồng đăng nhập, biểu đồ và đăng xuất trên trình duyệt.
