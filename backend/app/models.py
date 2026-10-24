from typing import Literal

from pydantic import BaseModel, Field


LibraryStatus = Literal["want_to_play", "playing", "completed", "dropped"]


class AuthUser(BaseModel):
    id: str
    email: str | None = None


class ProfileUpdate(BaseModel):
    display_name: str = Field(min_length=1, max_length=60)
    bio: str = Field(default="", max_length=500)


class ReviewUpsert(BaseModel):
    game_name: str = Field(min_length=1, max_length=200)
    score: int = Field(ge=1, le=10)
    recommended: bool
    body: str = Field(min_length=10, max_length=2000)


class LibraryUpsert(BaseModel):
    game_name: str = Field(min_length=1, max_length=200)
    game_slug: str = Field(min_length=1, max_length=220)
    background_image: str | None = None
    status: LibraryStatus
    favorite: bool = False
