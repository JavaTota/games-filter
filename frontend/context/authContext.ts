import { createContext } from "react";

import type { SupabaseSession } from "../types/auth";
import type { Profile } from "../types/community";

export interface AuthValue {
  session: SupabaseSession | null;
  profile: Profile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, displayName: string) => Promise<boolean>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

export const AuthContext = createContext<AuthValue | null>(null);
