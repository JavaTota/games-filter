/** Supabase rows are intentionally small and game-provider agnostic. */
export type LibraryStatus = "want_to_play" | "playing" | "completed" | "dropped";

export interface LibraryEntry {
  id?: number;
  user_id: string;
  game_id: number;
  game_name: string;
  game_slug: string;
  background_image: string | null;
  status: LibraryStatus;
  favorite: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface Review {
  id: number;
  user_id: string;
  game_id: number;
  game_name: string;
  display_name: string;
  score: number;
  recommended: boolean;
  body: string;
  created_at: string;
  updated_at: string;
}

export interface GameMeterSummary {
  score: number;
  recommendedPercent: number;
  reviewCount: number;
}
