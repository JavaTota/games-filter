from fastapi import APIRouter, Depends

from app.dependencies import current_token, current_user, optional_token
from app.models import AuthUser, ReviewUpsert
from app.services.supabase import supabase

router = APIRouter(tags=["reviews"])


async def get_viewer_helpful_votes(
    review_ids: list[int],
    token: str | None,
) -> set[int]:
    if not token or not review_ids:
        return set()

    try:
        user = await supabase.get_user(token)
    except PermissionError:
        return set()

    ids = ",".join(str(review_id) for review_id in review_ids)
    rows = await supabase.rest(
        (
            "review_helpful_votes"
            f"?user_id=eq.{user.id}"
            f"&review_id=in.({ids})"
            "&select=review_id"
        ),
        token=token,
    )

    return {row["review_id"] for row in rows}


@router.get("/games/{game_id}/reviews")
async def get_reviews(
    game_id: int,
    token: str | None = Depends(optional_token),
) -> object:
    reviews = await supabase.rest(
        f"review_feed?game_id=eq.{game_id}&select=*&order=updated_at.desc"
    )
    stats_rows = await supabase.rest(
        f"game_review_stats?game_id=eq.{game_id}&select=*"
    )

    helpful_votes = await get_viewer_helpful_votes(
        [review["id"] for review in reviews],
        token,
    )

    for review in reviews:
        review["viewer_helpful"] = review["id"] in helpful_votes

    stats = stats_rows[0] if stats_rows else empty_review_stats(game_id)
    return {"reviews": reviews, "stats": stats}


@router.put("/games/{game_id}/review")
async def upsert_review(
    game_id: int,
    payload: ReviewUpsert,
    user: AuthUser = Depends(current_user),
    token: str = Depends(current_token),
) -> object:
    review = {
        "user_id": user.id,
        "game_id": game_id,
        **payload.model_dump(),
    }

    # The database has a unique (user_id, game_id) key, so this edits instead of duplicating.
    rows = await supabase.rest(
        "reviews?on_conflict=user_id,game_id",
        method="POST",
        token=token,
        json_body=review,
        prefer="resolution=merge-duplicates,return=representation",
    )
    return rows[0]


@router.delete("/games/{game_id}/review", status_code=204)
async def delete_review(
    game_id: int,
    user: AuthUser = Depends(current_user),
    token: str = Depends(current_token),
) -> None:
    path = f"reviews?user_id=eq.{user.id}&game_id=eq.{game_id}"
    await supabase.rest(
        path,
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
    path = f"review_helpful_votes?review_id=eq.{review_id}&user_id=eq.{user.id}"
    await supabase.rest(
        path,
        method="DELETE",
        token=token,
        prefer="return=minimal",
    )


def empty_review_stats(game_id: int) -> dict[str, int]:
    return {
        "game_id": game_id,
        "review_count": 0,
        "score": 0,
        "recommended_percent": 0,
    }
