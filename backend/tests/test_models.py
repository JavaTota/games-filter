import pytest
from pydantic import ValidationError

from app.models import ReviewUpsert


def test_review_score_is_bounded() -> None:
    with pytest.raises(ValidationError):
        ReviewUpsert(
            game_name="Portal 2",
            score=11,
            recommended=True,
            body="Excellent puzzle game.",
        )


def test_review_requires_meaningful_body() -> None:
    with pytest.raises(ValidationError):
        ReviewUpsert(
            game_name="Portal 2",
            score=10,
            recommended=True,
            body="Too short",
        )
