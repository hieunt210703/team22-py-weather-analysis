# Phân tích dữ liệu thời tiết

Ứng dụng minh họa cách tổ chức frontend React và backend Python cho một sản phẩm phân tích dữ liệu thời tiết thực tế.

## Yêu cầu

- Python 3.14
- Node.js
- Windows PowerShell
- SQL Server Express LocalDB
- ODBC Driver 17 hoặc 18 for SQL Server

## Cài đặt

Cài đặt backend và khởi tạo dữ liệu mẫu:

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install -r requirements-dev.txt
python -m weather_analysis.seed
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
- `backend/weather_analysis/services/`: nghiệp vụ xác thực.
- `backend/weather_analysis/repositories/`: truy cập dữ liệu qua SQLAlchemy ORM.
- `backend/tests/`: unit test và API test.
- `frontend/src/api/`: mã gọi API từ trình duyệt.
- `frontend/src/pages/`: các màn hình của ứng dụng.
- `frontend/src/components/`: các thành phần giao diện dùng lại được.

## Biến môi trường

- `WEATHER_DB_URL`: URL kết nối SQLAlchemy. Khi không đặt, ứng dụng dùng SQL Server LocalDB.
- `WEATHER_DB_NAME`: tên database LocalDB. Mặc định là `WeatherAnalysis`.
- `WEATHER_DB_DIR`: thư mục chứa tệp `.mdf` và `.ldf`. Mặc định là `backend/data`.
- `WEATHER_SESSION_SECRET`: khóa dùng để ký session cookie. Phải đặt thành một giá trị bí mật khi triển khai thật.

Khi dùng SQL Server thật, đặt `WEATHER_DB_URL` theo dạng
`mssql+pyodbc://user:password@server/WeatherAnalysis?driver=ODBC+Driver+18+for+SQL+Server&TrustServerCertificate=yes`.
Database trên server thật cần được tạo trước khi chạy ứng dụng.
