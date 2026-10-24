from __future__ import annotations

from urllib.parse import quote

import httpx

from app.config import get_settings
from app.models import AuthUser


class SupabaseGateway:
    def __init__(self) -> None:
        settings = get_settings()
        self.base_url = settings.supabase_url.rstrip("/")
        self.publishable_key = settings.supabase_publishable_key

    def ensure_configured(self) -> None:
        if not self.base_url or not self.publishable_key:
            raise RuntimeError("Supabase is not configured on the backend.")

    def build_headers(
        self,
        token: str | None = None,
        extra: dict[str, str] | None = None,
    ) -> dict[str, str]:
        headers = {
            "apikey": self.publishable_key,
            "Content-Type": "application/json",
        }

        if token:
            headers["Authorization"] = f"Bearer {token}"

        if extra:
            headers.update(extra)

        return headers

    async def get_user(self, token: str) -> AuthUser:
        self.ensure_configured()

        async with httpx.AsyncClient(timeout=15) as client:
            response = await client.get(
                f"{self.base_url}/auth/v1/user",
                headers=self.build_headers(token),
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
        self.ensure_configured()

        extra_headers = {"Prefer": prefer} if prefer else None

        async with httpx.AsyncClient(timeout=20) as client:
            response = await client.request(
                method,
                f"{self.base_url}/rest/v1/{path}",
                headers=self.build_headers(token, extra_headers),
                json=json_body,
            )

        if response.status_code >= 400:
            details = self.read_error(response)
            raise RuntimeError(
                f"Supabase request failed ({response.status_code}): {details}"
            )

        if response.status_code == 204 or not response.content:
            return None

        return response.json()

    async def upload_avatar(
        self,
        token: str,
        user_id: str,
        image: bytes,
        content_type: str,
    ) -> str:
        self.ensure_configured()

        object_path = f"{user_id}/avatar"
        object_url = (
            f"{self.base_url}/storage/v1/object/avatars/{quote(object_path)}"
        )

        async with httpx.AsyncClient(timeout=30) as client:
            response = await client.post(
                object_url,
                headers={
                    "apikey": self.publishable_key,
                    "Authorization": f"Bearer {token}",
                    "Content-Type": content_type,
                    "x-upsert": "true",
                },
                content=image,
            )

        if response.status_code >= 400:
            raise RuntimeError(
                f"Avatar upload failed ({response.status_code}): {response.text}"
            )

        return f"{self.base_url}/storage/v1/object/public/avatars/{object_path}"

    async def delete_avatar(self, token: str, user_id: str) -> None:
        self.ensure_configured()

        object_path = f"{user_id}/avatar"
        object_url = (
            f"{self.base_url}/storage/v1/object/avatars/{quote(object_path)}"
        )

        async with httpx.AsyncClient(timeout=20) as client:
            response = await client.delete(
                object_url,
                headers=self.build_headers(token),
            )

        if response.status_code not in (200, 204, 404):
            raise RuntimeError(
                f"Avatar deletion failed ({response.status_code})."
            )

    @staticmethod
    def read_error(response: httpx.Response) -> object:
        content_type = response.headers.get("content-type", "")
        if "json" in content_type:
            return response.json()
        return response.text


supabase = SupabaseGateway()
