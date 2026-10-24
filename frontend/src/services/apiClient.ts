import { getSession } from "./supabaseClient";

const apiBaseUrl = (import.meta.env.VITE_API_BASE_URL ?? "").replace(/\/$/, "");

interface ApiErrorBody {
  detail?: string;
  message?: string;
}

export async function apiRequest<T>(
  path: string,
  init: RequestInit = {},
  requireAuth = false,
): Promise<T> {
  const headers = new Headers(init.headers);

  // Only fetch a session when this endpoint actually requires authentication.
  const session = requireAuth ? await getSession() : null;

  if (requireAuth && !session) {
    throw new Error("Please sign in to continue.");
  }

  // JSON content type is only needed when we are actually sending a body.
  if (init.body && !(init.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  // Public RAWG requests do not need the user's Supabase token.
  if (requireAuth && session) {
    headers.set("Authorization", `Bearer ${session.access_token}`);
  }

  const response = await fetch(`${apiBaseUrl}${path}`, {
    ...init,
    headers,
  });

  if (!response.ok) {
    const body = (await response.json().catch(() => ({}))) as ApiErrorBody;

    const message =
      body.detail ??
      body.message ??
      `Request failed (${response.status}).`;

    throw new Error(message);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}