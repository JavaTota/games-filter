from fastapi import APIRouter, Depends, HTTPException

from app.dependencies import current_token, current_user, optional_token
from app.models import AuthUser, ReviewUpsert
from app.services.supabase import supabase

router = APIRouter(tags=["reviews"])


async def _viewer_helpful(review_ids: list[int], token: str | None) -> set[int]:
    if not token or not review_ids:
        return set()
    try:
        user = await supabase.get_user(token)
    except PermissionError:
        return set()
    ids = ",".join(str(review_id) for review_id in review_ids)
    rows = await supabase.rest(
        f"review_helpful_votes?user_id=eq.{user.id}&review_id=in.({ids})&select=review_id",
        token=token,
    )
    return {row["review_id"] for row in rows}


@router.get("/games/{game_id}/reviews")
async def get_reviews(game_id: int, token: str | None = Depends(optional_token)) -> object:
    """Return public reviews plus aggregate GameMeter data in one round trip."""

    reviews = await supabase.rest(
        f"review_feed?game_id=eq.{game_id}&select=*&order=updated_at.desc"
    )
    stats_rows = await supabase.rest(
        f"game_review_stats?game_id=eq.{game_id}&select=*"
    )
    helpful = await _viewer_helpful([row["id"] for row in reviews], token)
    for review in reviews:
        review["viewer_helpful"] = review["id"] in helpful

    stats = stats_rows[0] if stats_rows else {
        "game_id": game_id,
        "review_count": 0,
        "score": 0,
        "recommended_percent": 0,
    }
    return {"reviews": reviews, "stats": stats}


@router.put("/games/{game_id}/review")
async def upsert_review(
    game_id: int,
    payload: ReviewUpsert,
    user: AuthUser = Depends(current_user),
    token: str = Depends(current_token),
) -> object:
    """Upsert by (user_id, game_id): a second submission edits, never duplicates."""

    rows = await supabase.rest(
        "reviews?on_conflict=user_id,game_id",
        method="POST",
        token=token,
        json_body={"user_id": user.id, "game_id": game_id, **payload.model_dump()},
        prefer="resolution=merge-duplicates,return=representation",
    )
    return rows[0]


@router.delete("/games/{game_id}/review", status_code=204)
async def delete_review(
    game_id: int,
    user: AuthUser = Depends(current_user),
    token: str = Depends(current_token),
) -> None:
    await supabase.rest(
        f"reviews?user_id=eq.{user.id}&game_id=eq.{game_id}",
        method="DELETE",
        token=token,
        prefer="return=minimal",
    )


@router.put("/reviews/{review_id}/helpful", status_code=204)
async def mark_helpful(
    review_id: int,
    user: AuthUser = Depends(current_user),
    token: str = Depends(current_token),
) -> None:
    # The unique key makes this idempotent and prevents repeat votes.
    await supabase.rest(
        "review_helpful_votes?on_conflict=review_id,user_id",
        method="POST",
        token=token,
        json_body={"review_id": review_id, "user_id": user.id},
        prefer="resolution=ignore-duplicates,return=minimal",
    )


@router.delete("/reviews/{review_id}/helpful", status_code=204)
async def unmark_helpful(
    review_id: int,
    user: AuthUser = Depends(current_user),
    token: str = Depends(current_token),
) -> None:
    await supabase.rest(
        f"review_helpful_votes?review_id=eq.{review_id}&user_id=eq.{user.id}",
        method="DELETE",
        token=token,
        prefer="return=minimal",
    )
