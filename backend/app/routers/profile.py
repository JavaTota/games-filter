from time import time

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile

from app.dependencies import current_token, current_user
from app.models import AuthUser, ProfileUpdate
from app.services.supabase import supabase

router = APIRouter(tags=["profile"])
ALLOWED_AVATAR_TYPES = {"image/jpeg", "image/png", "image/webp"}
MAX_AVATAR_BYTES = 2 * 1024 * 1024


@router.get("/profile")
async def get_profile(user: AuthUser = Depends(current_user), token: str = Depends(current_token)) -> object:
    rows = await supabase.rest(f"profiles?id=eq.{user.id}&select=*", token=token)
    return rows[0] if rows else None


@router.patch("/profile")
async def update_profile(
    payload: ProfileUpdate,
    user: AuthUser = Depends(current_user),
    token: str = Depends(current_token),
) -> object:
    rows = await supabase.rest(
        f"profiles?id=eq.{user.id}",
        method="PATCH",
        token=token,
        json_body={"display_name": payload.display_name.strip(), "bio": payload.bio.strip()},
        prefer="return=representation",
    )
    return rows[0]


@router.post("/profile/avatar")
async def upload_avatar(
    avatar: UploadFile = File(...),
    user: AuthUser = Depends(current_user),
    token: str = Depends(current_token),
) -> object:
    if avatar.content_type not in ALLOWED_AVATAR_TYPES:
        raise HTTPException(status_code=400, detail="Avatar must be JPG, PNG, or WebP.")
    data = await avatar.read(MAX_AVATAR_BYTES + 1)
    if len(data) > MAX_AVATAR_BYTES:
        raise HTTPException(status_code=400, detail="Avatar must be 2 MB or smaller.")

    url = await supabase.upload_avatar(token, user.id, data, avatar.content_type)
    # Cache-busting query updates browsers immediately after replacing the same object key.
    avatar_url = f"{url}?v={int(time())}"
    rows = await supabase.rest(
        f"profiles?id=eq.{user.id}",
        method="PATCH",
        token=token,
        json_body={"avatar_url": avatar_url},
        prefer="return=representation",
    )
    return rows[0]


@router.delete("/profile/avatar")
async def delete_avatar(
    user: AuthUser = Depends(current_user),
    token: str = Depends(current_token),
) -> object:
    await supabase.delete_avatar(token, user.id)
    rows = await supabase.rest(
        f"profiles?id=eq.{user.id}",
        method="PATCH",
        token=token,
        json_body={"avatar_url": None},
        prefer="return=representation",
    )
    return rows[0]
