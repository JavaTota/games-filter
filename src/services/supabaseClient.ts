import type { SupabaseSession, SupabaseUser } from "../types/auth";

const url = import.meta.env.VITE_SUPABASE_URL?.replace(/\/$/, "") ?? "";
const publishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ?? import.meta.env.VITE_SUPABASE_ANON_KEY ?? "";
const SESSION_KEY = "gamefilter.supabase.session";

export const isSupabaseConfigured = Boolean(url && publishableKey);

function requireConfig() {
  if (!isSupabaseConfigured) throw new Error("Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY.");
}

function readSession(): SupabaseSession | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) as SupabaseSession : null;
  } catch {
    return null;
  }
}

function saveSession(session: SupabaseSession | null) {
  if (session) localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  else localStorage.removeItem(SESSION_KEY);
}

function normalizeSession(payload: { access_token: string; refresh_token: string; expires_in: number; user: SupabaseUser }): SupabaseSession {
  return { ...payload, expires_at: Math.floor(Date.now() / 1000) + payload.expires_in };
}

async function authRequest<T>(path: string, init: RequestInit) {
  requireConfig();
  const response = await fetch(`${url}/auth/v1${path}`, {
    ...init,
    headers: { apikey: publishableKey, "Content-Type": "application/json", ...(init.headers ?? {}) },
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload.msg || payload.message || payload.error_description || "Authentication request failed.");
  return payload as T;
}

/** Refreshes expiring sessions so RLS-backed writes keep working during longer visits. */
export async function getSession(): Promise<SupabaseSession | null> {
  const session = readSession();
  if (!session || !isSupabaseConfigured) return session;
  if (session.expires_at > Math.floor(Date.now() / 1000) + 60) return session;

  try {
    const payload = await authRequest<{ access_token: string; refresh_token: string; expires_in: number; user: SupabaseUser }>("/token?grant_type=refresh_token", {
      method: "POST",
      body: JSON.stringify({ refresh_token: session.refresh_token }),
    });
    const refreshed = normalizeSession(payload);
    saveSession(refreshed);
    return refreshed;
  } catch {
    saveSession(null);
    return null;
  }
}

export async function signIn(email: string, password: string) {
  const payload = await authRequest<{ access_token: string; refresh_token: string; expires_in: number; user: SupabaseUser }>("/token?grant_type=password", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
  const session = normalizeSession(payload);
  saveSession(session);
  return session;
}

export async function signUp(email: string, password: string, displayName: string) {
  const payload = await authRequest<{ access_token?: string; refresh_token?: string; expires_in?: number; user: SupabaseUser }>("/signup", {
    method: "POST",
    body: JSON.stringify({ email, password, data: { display_name: displayName } }),
  });
  if (payload.access_token && payload.refresh_token && payload.expires_in) {
    const session = normalizeSession(payload as { access_token: string; refresh_token: string; expires_in: number; user: SupabaseUser });
    saveSession(session);
    return { session, user: payload.user };
  }
  return { session: null, user: payload.user };
}

export async function signOut() {
  const session = readSession();
  if (session && isSupabaseConfigured) {
    await fetch(`${url}/auth/v1/logout`, { method: "POST", headers: { apikey: publishableKey, Authorization: `Bearer ${session.access_token}` } }).catch(() => undefined);
  }
  saveSession(null);
}

/** REST helper sends the current JWT; Supabase RLS remains the authorization boundary. */
export async function supabaseRest<T>(path: string, init: RequestInit = {}, authenticated = false): Promise<T> {
  requireConfig();
  const storedSession = readSession();
  const session = authenticated || storedSession ? await getSession() : null;
  if (authenticated && !session) throw new Error("Please sign in to continue.");

  const response = await fetch(`${url}/rest/v1/${path}`, {
    ...init,
    headers: {
      apikey: publishableKey,
      ...(session ? { Authorization: `Bearer ${session.access_token}` } : {}),
      "Content-Type": "application/json",
      ...(init.headers ?? {}),
    },
  });

  if (!response.ok) {
    const payload = await response.json().catch(() => ({}));
    throw new Error(payload.message || payload.details || `Supabase request failed (${response.status}).`);
  }
  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}
