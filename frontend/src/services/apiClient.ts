import { getSession } from "./supabaseClient";

const baseUrl = (import.meta.env.VITE_API_BASE_URL ?? "").replace(/\/$/, "");

/** Central fetch helper keeps auth headers and backend errors consistent. */
export async function apiRequest<T>(path: string, init: RequestInit = {}, requireAuth = false): Promise<T> {
  const session = await getSession();
  if (requireAuth && !session) throw new Error("Please sign in to continue.");

  const headers = new Headers(init.headers);
  if (!(init.body instanceof FormData)) headers.set("Content-Type", "application/json");
  if (session) headers.set("Authorization", `Bearer ${session.access_token}`);

  const response = await fetch(`${baseUrl}${path}`, { ...init, headers });
  if (!response.ok) {
    const payload = await response.json().catch(() => ({}));
    throw new Error(payload.detail || payload.message || `Request failed (${response.status}).`);
  }
  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}
