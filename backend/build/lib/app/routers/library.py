from fastapi import APIRouter, Depends

from app.dependencies import current_token, current_user
from app.models import AuthUser, LibraryUpsert
from app.services.supabase import supabase

router = APIRouter(tags=["library"])


@router.get("/library")
async def list_library(
    user: AuthUser = Depends(current_user),
    token: str = Depends(current_token),
) -> object:
    path = f"library_entries?user_id=eq.{user.id}&select=*&order=updated_at.desc"
    return await supabase.rest(path, token=token)


@router.get("/library/{game_id}")
async def get_library_entry(
    game_id: int,
    user: AuthUser = Depends(current_user),
    token: str = Depends(current_token),
) -> object:
    path = f"library_entries?user_id=eq.{user.id}&game_id=eq.{game_id}&select=*"
    rows = await supabase.rest(path, token=token)
    return rows[0] if rows else None


@router.put("/library/{game_id}")
async def upsert_library_entry(
    game_id: int,
    payload: LibraryUpsert,
    user: AuthUser = Depends(current_user),
    token: str = Depends(current_token),
) -> object:
    library_entry = {
        "user_id": user.id,
        "game_id": game_id,
        **payload.model_dump(),
    }

    rows = await supabase.rest(
        "library_entries?on_conflict=user_id,game_id",
        method="POST",
        token=token,
        json_body=library_entry,
        prefer="resolution=merge-duplicates,return=representation",
    )
    return rows[0]


@router.delete("/library/{game_id}", status_code=204)
async def delete_library_entry(
    game_id: int,
    user: AuthUser = Depends(current_user),
    token: str = Depends(current_token),
) -> None:
    path = f"library_entries?user_id=eq.{user.id}&game_id=eq.{game_id}"
    await supabase.rest(
        path,
        method="DELETE",
        token=token,
        prefer="return=minimal",
    )
