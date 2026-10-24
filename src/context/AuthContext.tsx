import { createContext, type ReactNode, useContext, useEffect, useState } from "react";
import type { SupabaseSession } from "../types/auth";
import { getSession, signIn as apiSignIn, signOut as apiSignOut, signUp as apiSignUp } from "../services/supabaseClient";

interface AuthValue {
  session: SupabaseSession | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, displayName: string) => Promise<boolean>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthValue | null>(null);

/** Auth state is centralized so every Supabase-backed feature sees the same session. */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<SupabaseSession | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { getSession().then(setSession).finally(() => setLoading(false)); }, []);

  const signIn = async (email: string, password: string) => setSession(await apiSignIn(email, password));
  const signUp = async (email: string, password: string, displayName: string) => {
    const result = await apiSignUp(email, password, displayName);
    setSession(result.session);
    return Boolean(result.session);
  };
  const signOut = async () => { await apiSignOut(); setSession(null); };

  return <AuthContext.Provider value={{ session, loading, signIn, signUp, signOut }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error("useAuth must be used inside AuthProvider.");
  return value;
}
