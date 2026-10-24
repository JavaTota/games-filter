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

export interface LibraryEntryInput {
  game_name: string;
  game_slug: string;
  background_image: string | null;
  status: LibraryStatus;
  favorite: boolean;
}

export interface Review {
  id: number;
  user_id: string;
  game_id: number;
  game_name: string;
  display_name: string;
  avatar_url: string | null;
  score: number;
  recommended: boolean;
  body: string;
  helpful_count: number;
  viewer_helpful: boolean;
  created_at: string;
  updated_at: string;
}

export interface GameMeterSummary {
  score: number;
  recommendedPercent: number;
  reviewCount: number;
}

export interface ReviewBundle {
  reviews: Review[];
  stats: {
    game_id: number;
    score: number;
    recommended_percent: number;
    review_count: number;
  };
}

export interface Profile {
  id: string;
  display_name: string;
  avatar_url: string | null;
  bio: string;
  created_at: string;
  updated_at: string;
}
