export interface SupabaseUser {
  id: string;
  email?: string;
  user_metadata?: { display_name?: string };
}

export interface SupabaseSession {
  access_token: string;
  refresh_token: string;
  expires_at: number;
  user: SupabaseUser;
}
