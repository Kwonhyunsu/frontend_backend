# FastAPI Movie Recommender (MySQL)

## 1) Setup with uv and requirements.txt
```powershell
cd backend_fastapi_movie_recsys
uv python install 3.13
uv venv --python 3.13 .venv
.\.venv\Scripts\Activate.ps1
uv pip install -r requirements.txt
Copy-Item .env.example .env
```

This dependency set requires Python 3.12 or newer.

`.env` defaults:
```env
DB_USER=fastapiid
DB_PASSWORD=fastapipw
DB_HOST=127.0.0.1
DB_PORT=3306
DB_NAME=moviesdb
DEFAULT_LIMIT=12
```

## 2) Setup with uv sync
This project now includes `pyproject.toml`, so you can install dependencies with `uv sync` instead of `uv pip install`.

```powershell
cd backend_fastapi_movie_recsys
uv python install 3.13
uv venv --python 3.13 .venv
uv sync
Copy-Item .env.example .env
```

If you prefer activating the virtual environment first:
```powershell
.\.venv\Scripts\Activate.ps1
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

If PowerShell activation is blocked or you want the most stable direct command on Windows:
```powershell
.\.venv\Scripts\python.exe -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

## 3) MySQL
Create the database, tables, and sample data:

```powershell
mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS moviesdb CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
mysql -u root -p moviesdb < sql/schema.sql
mysql -u root -p moviesdb < sql/seed.sql
```

Database tables are created by `sql/schema.sql`. The API process still needs the database connection for endpoints that query MySQL.

## 4) Run
Recommended run command on Windows:

```powershell
.\.venv\Scripts\python.exe -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

If activation works in your shell, this is also fine:
```powershell
.\.venv\Scripts\Activate.ps1
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

Open:
- `http://127.0.0.1:8000/`
- `http://127.0.0.1:8000/docs`

## 5) API
- `GET /api/movies` - list movies with paging
- `GET /api/users` - list users
- `GET /api/users/{user_id}/ratings` - get one user's ratings
- `POST /api/users/{user_id}/ratings` - add or update a rating with `{ "movie_id": 1, "rating": 4.5 }`
- `GET /api/recommend?user_id=1&limit=12` - personalized recommendations

The recommender is content-based with TF-IDF over `genres` and `overview`, then falls back to popularity for cold-start users.
