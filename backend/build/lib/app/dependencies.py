from fastapi import Depends, HTTPException
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from app.models import AuthUser
from app.services.supabase import supabase

bearer = HTTPBearer(auto_error=False)


async def current_token(
    credentials: HTTPAuthorizationCredentials | None = Depends(bearer),
) -> str:
    if not credentials:
        raise HTTPException(status_code=401, detail="Sign in to continue.")

    return credentials.credentials


async def current_user(token: str = Depends(current_token)) -> AuthUser:
    try:
        return await supabase.get_user(token)
    except PermissionError as error:
        raise HTTPException(status_code=401, detail=str(error)) from error


async def optional_token(
    credentials: HTTPAuthorizationCredentials | None = Depends(bearer),
) -> str | None:
    if not credentials:
        return None

    return credentials.credentials
