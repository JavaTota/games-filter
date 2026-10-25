import { type ReactNode, useCallback, useEffect, useState } from "react";

import { getProfile } from "../services/profileService";
import {
  getSession,
  signIn as signInWithSupabase,
  signOut as signOutWithSupabase,
  signUp as signUpWithSupabase,
} from "../services/supabaseClient";
import type { SupabaseSession } from "../types/auth";
import type { Profile } from "../types/community";
import { AuthContext } from "./authContext";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<SupabaseSession | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshProfile = useCallback(async () => {
    try {
      setProfile(await getProfile());
    } catch {
      setProfile(null);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    const restoreSession = async () => {
      const savedSession = await getSession();
      if (cancelled) return;

      setSession(savedSession);

      if (savedSession) {
        await refreshProfile();
      }

      if (!cancelled) setLoading(false);
    };

    void restoreSession();

    return () => {
      cancelled = true;
    };
  }, [refreshProfile]);

  const signIn = async (email: string, password: string) => {
    const nextSession = await signInWithSupabase(email, password);
    setSession(nextSession);
    await refreshProfile();
  };

  const signUp = async (
    email: string,
    password: string,
    displayName: string,
  ) => {
    const result = await signUpWithSupabase(email, password, displayName);
    setSession(result.session);

    if (result.session) {
      await refreshProfile();
    }

    return Boolean(result.session);
  };

  const signOut = async () => {
    await signOutWithSupabase();
    setSession(null);
    setProfile(null);
  };

  return (
    <AuthContext.Provider
      value={{
        session,
        profile,
        loading,
        signIn,
        signUp,
        signOut,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
