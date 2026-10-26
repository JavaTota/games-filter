from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import get_settings
from app.routers import health, library, profile, rawg, reviews

settings = get_settings()

app = FastAPI(
    title="GameMeter API",
    version="2.0.0",
    description=(
        "Python backend for game discovery, profiles, libraries, "
        "and GameMeter reviews."
    ),
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins,
    allow_credentials="*" not in settings.allowed_origins,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type"],
)

for router in (health.router, rawg.router, profile.router, library.router, reviews.router):
    app.include_router(router, prefix="/api")
