from __future__ import annotations

import asyncio
import time
from dataclasses import dataclass

import httpx

from app.config import get_settings


@dataclass
class CacheEntry:
    expires_at: float
    payload: object


class RawgService:
    """Server-side RAWG client with a small TTL cache and a strict path allow-list."""

    BASE_URL = "https://api.rawg.io/api"
    ALLOWED_PREFIXES = ("/games", "/genres", "/platforms")

    def __init__(self) -> None:
        self._cache: dict[str, CacheEntry] = {}
        self._lock = asyncio.Lock()

    def _validate_path(self, path: str) -> None:
        if not path.startswith(self.ALLOWED_PREFIXES) or ".." in path or "://" in path:
            raise ValueError("RAWG path is not allowed.")

    async def get(self, path: str, params: dict[str, str]) -> object:
        self._validate_path(path)
        api_key = get_settings().rawg_api_key
        if not api_key:
            raise RuntimeError("RAWG_API_KEY is not configured.")

        clean_params = {key: value for key, value in params.items() if key != "path"}
        cache_key = f"{path}?{sorted(clean_params.items())}"
        cached = self._cache.get(cache_key)
        if cached and cached.expires_at > time.monotonic():
            return cached.payload

        async with self._lock:
            cached = self._cache.get(cache_key)
            if cached and cached.expires_at > time.monotonic():
                return cached.payload

            async with httpx.AsyncClient(timeout=20) as client:
                response = await client.get(
                    f"{self.BASE_URL}{path}",
                    params={**clean_params, "key": api_key},
                )
            if response.status_code >= 400:
                raise RuntimeError(f"RAWG returned {response.status_code}: {response.text[:300]}")
            payload = response.json()
            self._cache[cache_key] = CacheEntry(time.monotonic() + 60, payload)
            return payload


rawg_service = RawgService()
