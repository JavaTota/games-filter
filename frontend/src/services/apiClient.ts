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
  const session = await getSession();

  if (requireAuth && !session) {
    throw new Error("Please sign in to continue.");
  }

  const headers = new Headers(init.headers);

  if (!(init.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  if (session) {
    headers.set("Authorization", `Bearer ${session.access_token}`);
  }

  const response = await fetch(`${apiBaseUrl}${path}`, {
    ...init,
    headers,
  });

  if (!response.ok) {
    const body = (await response.json().catch(() => ({}))) as ApiErrorBody;
    const message =
      body.detail ?? body.message ?? `Request failed (${response.status}).`;
    throw new Error(message);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}
