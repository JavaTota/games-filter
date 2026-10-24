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
    BASE_URL = "https://api.rawg.io/api"
    ALLOWED_PREFIXES = ("/games", "/genres", "/platforms")
    CACHE_TTL_SECONDS = 60

    def __init__(self) -> None:
        self._cache: dict[str, CacheEntry] = {}
        self._lock = asyncio.Lock()

    def validate_path(self, path: str) -> None:
        is_allowed = path.startswith(self.ALLOWED_PREFIXES)
        looks_unsafe = ".." in path or "://" in path

        if not is_allowed or looks_unsafe:
            raise ValueError("RAWG path is not allowed.")

    async def get(self, path: str, params: dict[str, str]) -> object:
        self.validate_path(path)

        api_key = get_settings().rawg_api_key
        if not api_key:
            raise RuntimeError("RAWG_API_KEY is not configured.")

        clean_params = {
            key: value
            for key, value in params.items()
            if key != "path"
        }
        cache_key = self.make_cache_key(path, clean_params)

        cached = self.get_cached(cache_key)
        if cached is not None:
            return cached

        async with self._lock:
            cached = self.get_cached(cache_key)
            if cached is not None:
                return cached

            payload = await self.fetch(path, clean_params, api_key)
            self._cache[cache_key] = CacheEntry(
                expires_at=time.monotonic() + self.CACHE_TTL_SECONDS,
                payload=payload,
            )
            return payload

    def get_cached(self, key: str) -> object | None:
        cached = self._cache.get(key)
        if not cached or cached.expires_at <= time.monotonic():
            return None
        return cached.payload

    @staticmethod
    def make_cache_key(path: str, params: dict[str, str]) -> str:
        return f"{path}?{sorted(params.items())}"

    async def fetch(
        self,
        path: str,
        params: dict[str, str],
        api_key: str,
    ) -> object:
        async with httpx.AsyncClient(timeout=20) as client:
            response = await client.get(
                f"{self.BASE_URL}{path}",
                params={**params, "key": api_key},
            )

        if response.status_code >= 400:
            details = response.text[:300]
            raise RuntimeError(
                f"RAWG returned {response.status_code}: {details}"
            )

        return response.json()


rawg_service = RawgService()
