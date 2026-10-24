from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import get_settings
from app.routers import health, library, profile, rawg, reviews

settings = get_settings()
origins = settings.allowed_origins
app = FastAPI(
    title="GameFilter API",
    version="2.0.0",
    description="Python backend for game discovery, profiles, libraries, and GameMeter reviews.",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    # Bearer-token APIs do not need cookies, so wildcard CORS remains compatible.
    allow_credentials=False if "*" in origins else True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type"],
)

# Prefixing every route with /api keeps local Docker and cloud URLs identical.
app.include_router(health.router, prefix="/api")
app.include_router(rawg.router, prefix="/api")
app.include_router(profile.router, prefix="/api")
app.include_router(library.router, prefix="/api")
app.include_router(reviews.router, prefix="/api")
