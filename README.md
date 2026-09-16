# Phân tích dữ liệu thời tiết

Ứng dụng minh họa cách tổ chức frontend React và backend Python cho một sản phẩm phân tích dữ liệu thực tế. Sau khi đăng nhập, người dùng có thể xem biểu đồ so sánh nhiệt độ trung bình 12 tháng của Hà Nội và TP.HCM.

## Yêu cầu

- Python 3.14
- Node.js
- Windows PowerShell

## Cài đặt

Cài đặt backend:

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install -r requirements-dev.txt
```

Cài đặt frontend trong một terminal khác:

```powershell
cd frontend
npm install
```

## Chạy ứng dụng

Khởi động backend tại `http://localhost:8000`:

```powershell
cd backend
.\.venv\Scripts\Activate.ps1
uvicorn weather_analysis.api.app:app --reload
```

Khởi động frontend tại `http://localhost:5173` trong một terminal khác:

```powershell
cd frontend
npm run dev
```

Mở `http://localhost:5173` và đăng nhập bằng:

- Tên đăng nhập: `admin`
- Mật khẩu: `adminpw`

## Chạy kiểm tra

Kiểm tra backend:

```powershell
cd backend
.\.venv\Scripts\Activate.ps1
pyright
ruff check .
pytest -q
```

Kiểm tra frontend:

```powershell
cd frontend
npm run lint
npm run build
npm test
```

## Cấu trúc chính

- `backend/weather_analysis/api/`: các route FastAPI và schema trao đổi dữ liệu.
- `backend/weather_analysis/services/`: nghiệp vụ xác thực và tổng hợp dữ liệu biểu đồ.
- `backend/weather_analysis/repositories/`: truy vấn SQLite.
- `backend/tests/`: unit test và API test.
- `frontend/src/api/`: mã gọi API từ trình duyệt.
- `frontend/src/pages/`: màn hình đăng nhập và dashboard.
- `frontend/src/components/`: các thành phần giao diện dùng lại được.

## Biến môi trường

- `WEATHER_DB_PATH`: đường dẫn tệp SQLite. Mặc định là `backend/data/weather.db`.
- `WEATHER_SESSION_SECRET`: khóa dùng để ký session cookie. Phải đặt thành một giá trị bí mật khi triển khai thật.
