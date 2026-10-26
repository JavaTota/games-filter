import type { SupabaseSession, SupabaseUser } from "../types/auth";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL?.replace(/\/$/, "") ?? "";
const publishableKey =
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ??
  import.meta.env.VITE_SUPABASE_ANON_KEY ??
  "";
const SESSION_KEY = "gamefilter.supabase.session";

export const isSupabaseConfigured = Boolean(supabaseUrl && publishableKey);

interface AuthSessionPayload {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  user: SupabaseUser;
}

interface SignupPayload {
  access_token?: string;
  refresh_token?: string;
  expires_in?: number;
  user: SupabaseUser;
}

function assertConfigured() {
  if (!isSupabaseConfigured) {
    throw new Error("Supabase Auth is not configured.");
  }
}

function readStoredSession(): SupabaseSession | null {
  try {
    const stored = localStorage.getItem(SESSION_KEY);
    return stored ? (JSON.parse(stored) as SupabaseSession) : null;
  } catch {
    return null;
  }
}

function storeSession(session: SupabaseSession | null) {
  if (session) {
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  } else {
    localStorage.removeItem(SESSION_KEY);
  }
}

function toSession(payload: AuthSessionPayload): SupabaseSession {
  return {
    ...payload,
    expires_at: Math.floor(Date.now() / 1000) + payload.expires_in,
  };
}

async function authRequest<T>(path: string, init: RequestInit) {
  assertConfigured();

  const response = await fetch(`${supabaseUrl}/auth/v1${path}`, {
    ...init,
    headers: {
      apikey: publishableKey,
      "Content-Type": "application/json",
      ...(init.headers ?? {}),
    },
  });

  const body = await response.json().catch(() => ({}));

  if (!response.ok) {
    const message =
      body.msg ??
      body.message ??
      body.error_description ??
      "Authentication request failed.";
    throw new Error(message);
  }

  return body as T;
}

async function consumeAuthCallback(): Promise<SupabaseSession | null> {
  if (!isSupabaseConfigured || !window.location.hash) {
    return null;
  }

  const params = new URLSearchParams(window.location.hash.slice(1));
  const accessToken = params.get("access_token");
  const refreshToken = params.get("refresh_token");

  if (!accessToken || !refreshToken) {
    return null;
  }

  const expiresAtParam = Number(params.get("expires_at"));
  const expiresIn = Number(params.get("expires_in") ?? 3600);

  try {
    const user = await authRequest<SupabaseUser>("/user", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const session: SupabaseSession = {
      access_token: accessToken,
      refresh_token: refreshToken,
      expires_at:
        expiresAtParam || Math.floor(Date.now() / 1000) + expiresIn,
      user,
    };

    storeSession(session);

    // Remove auth tokens from the address bar after they have been stored.
    window.history.replaceState(
      {},
      document.title,
      `${window.location.pathname}${window.location.search}`,
    );

    return session;
  } catch {
    return null;
  }
}

export async function getSession(): Promise<SupabaseSession | null> {
  const callbackSession = await consumeAuthCallback();
  if (callbackSession) {
    return callbackSession;
  }

  const session = readStoredSession();

  if (!session || !isSupabaseConfigured) {
    return session;
  }

  const expiresSoon = session.expires_at <= Math.floor(Date.now() / 1000) + 60;
  if (!expiresSoon) {
    return session;
  }

  try {
    const refreshed = await authRequest<AuthSessionPayload>(
      "/token?grant_type=refresh_token",
      {
        method: "POST",
        body: JSON.stringify({ refresh_token: session.refresh_token }),
      },
    );

    const nextSession = toSession(refreshed);
    storeSession(nextSession);
    return nextSession;
  } catch {
    storeSession(null);
    return null;
  }
}

export async function signIn(email: string, password: string) {
  const response = await authRequest<AuthSessionPayload>(
    "/token?grant_type=password",
    {
      method: "POST",
      body: JSON.stringify({ email, password }),
    },
  );

  const session = toSession(response);
  storeSession(session);
  return session;
}

export async function signUp(
  email: string,
  password: string,
  displayName: string,
) {
  const redirectTo = `${window.location.origin}/auth`;

  const response = await authRequest<SignupPayload>(
    `/signup?redirect_to=${encodeURIComponent(redirectTo)}`,
    {
      method: "POST",
      body: JSON.stringify({
        email,
        password,
        data: { display_name: displayName },
      }),
    },
  );

  if (response.access_token && response.refresh_token && response.expires_in) {
    const session = toSession(response as AuthSessionPayload);
    storeSession(session);
    return { session, user: response.user };
  }

  return { session: null, user: response.user };
}

export async function signOut() {
  const session = readStoredSession();

  if (session && isSupabaseConfigured) {
    await fetch(`${supabaseUrl}/auth/v1/logout`, {
      method: "POST",
      headers: {
        apikey: publishableKey,
        Authorization: `Bearer ${session.access_token}`,
      },
    }).catch(() => undefined);
  }

  storeSession(null);
}
