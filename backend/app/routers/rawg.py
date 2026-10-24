from fastapi import APIRouter, HTTPException, Request

from app.services.rawg import rawg_service

router = APIRouter(tags=["games"])


@router.get("/rawg")
async def rawg_proxy(request: Request, path: str) -> object:
    """Proxy only approved RAWG reads so the API key never reaches the browser."""

    try:
        return await rawg_service.get(path, dict(request.query_params))
    except ValueError as error:
        raise HTTPException(status_code=400, detail=str(error)) from error
    except RuntimeError as error:
        raise HTTPException(status_code=502, detail=str(error)) from error
