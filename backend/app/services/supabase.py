from __future__ import annotations

from urllib.parse import quote

import httpx

from app.config import get_settings
from app.models import AuthUser


class SupabaseGateway:
    """Small HTTP gateway keeps Supabase details out of route handlers.

    User JWTs are forwarded to Supabase so Postgres RLS remains the final
    authorization boundary. The backend never trusts a user_id from React.
    """

    def __init__(self) -> None:
        settings = get_settings()
        self.base_url = settings.supabase_url.rstrip("/")
        self.key = settings.supabase_publishable_key

    def _headers(self, token: str | None = None, extra: dict[str, str] | None = None) -> dict[str, str]:
        headers = {"apikey": self.key, "Content-Type": "application/json"}
        if token:
            headers["Authorization"] = f"Bearer {token}"
        if extra:
            headers.update(extra)
        return headers

    def _require_config(self) -> None:
        if not self.base_url or not self.key:
            raise RuntimeError("Supabase is not configured on the backend.")

    async def get_user(self, token: str) -> AuthUser:
        self._require_config()
        async with httpx.AsyncClient(timeout=15) as client:
            response = await client.get(
                f"{self.base_url}/auth/v1/user",
                headers=self._headers(token),
            )
        if response.status_code != 200:
            raise PermissionError("Invalid or expired Supabase session.")
        payload = response.json()
        return AuthUser(id=payload["id"], email=payload.get("email"))

    async def rest(
        self,
        path: str,
        *,
        method: str = "GET",
        token: str | None = None,
        json_body: object | None = None,
        prefer: str | None = None,
    ) -> object:
        self._require_config()
        extra = {"Prefer": prefer} if prefer else None
        async with httpx.AsyncClient(timeout=20) as client:
            response = await client.request(
                method,
                f"{self.base_url}/rest/v1/{path}",
                headers=self._headers(token, extra),
                json=json_body,
            )
        if response.status_code >= 400:
            detail = response.json() if "json" in response.headers.get("content-type", "") else response.text
            raise RuntimeError(f"Supabase request failed ({response.status_code}): {detail}")
        if response.status_code == 204 or not response.content:
            return None
        return response.json()

    async def upload_avatar(self, token: str, user_id: str, data: bytes, content_type: str) -> str:
        """Upload to a stable per-user key so replacing an avatar does not leak old files."""

        self._require_config()
        object_path = f"{user_id}/avatar"
        async with httpx.AsyncClient(timeout=30) as client:
            response = await client.post(
                f"{self.base_url}/storage/v1/object/avatars/{quote(object_path)}",
                headers={
                    "apikey": self.key,
                    "Authorization": f"Bearer {token}",
                    "Content-Type": content_type,
                    "x-upsert": "true",
                },
                content=data,
            )
        if response.status_code >= 400:
            raise RuntimeError(f"Avatar upload failed ({response.status_code}): {response.text}")
        return f"{self.base_url}/storage/v1/object/public/avatars/{object_path}"

    async def delete_avatar(self, token: str, user_id: str) -> None:
        self._require_config()
        object_path = f"{user_id}/avatar"
        async with httpx.AsyncClient(timeout=20) as client:
            response = await client.delete(
                f"{self.base_url}/storage/v1/object/avatars/{quote(object_path)}",
                headers=self._headers(token),
            )
        if response.status_code not in (200, 204, 404):
            raise RuntimeError(f"Avatar deletion failed ({response.status_code}).")


supabase = SupabaseGateway()
