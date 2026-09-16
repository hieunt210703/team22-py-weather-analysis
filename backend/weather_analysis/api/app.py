from collections.abc import AsyncIterator
from contextlib import asynccontextmanager

from fastapi import FastAPI
from starlette.middleware.sessions import SessionMiddleware

from weather_analysis.api.auth_routes import router as auth_router
from weather_analysis.api.temperature_routes import router as temperature_router
from weather_analysis.config import get_session_secret
from weather_analysis.database import connection_scope, create_schema
from weather_analysis.seed import seed_all


@asynccontextmanager
async def lifespan(_app: FastAPI) -> AsyncIterator[None]:
    with connection_scope() as connection:
        create_schema(connection)
        seed_all(connection)
    yield


app = FastAPI(title="Phân tích thời tiết", lifespan=lifespan)
app.add_middleware(SessionMiddleware, secret_key=get_session_secret())
app.include_router(auth_router)
app.include_router(temperature_router)
