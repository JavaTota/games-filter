from fastapi import APIRouter

router = APIRouter(tags=["health"])


@router.get("/health")
async def health() -> dict[str, str]:
    """Cheap endpoint used by Docker health checks and post-deploy smoke tests."""

    return {"status": "ok", "service": "gamefilter-api"}
