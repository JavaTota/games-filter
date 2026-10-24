import { createContext, type ReactNode, useCallback, useContext, useEffect, useState } from "react";
import type { SupabaseSession } from "../types/auth";
import type { Profile } from "../types/community";
import { getSession, signIn as apiSignIn, signOut as apiSignOut, signUp as apiSignUp } from "../services/supabaseClient";
import { getProfile } from "../services/profileService";

interface AuthValue {
  session: SupabaseSession | null;
  profile: Profile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, displayName: string) => Promise<boolean>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthValue | null>(null);

/** Auth stays in Supabase; user-owned application data is accessed through FastAPI. */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<SupabaseSession | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshProfile = useCallback(async () => {
    try { setProfile(await getProfile()); }
    catch { setProfile(null); }
  }, []);

  useEffect(() => {
    getSession().then(async (nextSession) => {
      setSession(nextSession);
      if (nextSession) await refreshProfile();
    }).finally(() => setLoading(false));
  }, [refreshProfile]);

  const signIn = async (email: string, password: string) => {
    setSession(await apiSignIn(email, password));
    await refreshProfile();
  };

  const signUp = async (email: string, password: string, displayName: string) => {
    const result = await apiSignUp(email, password, displayName);
    setSession(result.session);
    if (result.session) await refreshProfile();
    return Boolean(result.session);
  };

  const signOut = async () => {
    await apiSignOut();
    setSession(null);
    setProfile(null);
  };

  return <AuthContext.Provider value={{ session, profile, loading, signIn, signUp, signOut, refreshProfile }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error("useAuth must be used inside AuthProvider.");
  return value;
}
