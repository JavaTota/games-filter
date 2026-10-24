export interface Platform {
  id: number;
  name: string;
  slug: string;
}

export interface Genre {
  id: number;
  name: string;
  slug: string;
  image_background?: string;
}

export interface Game {
  id: number;
  slug: string;
  name: string;
  background_image: string | null;
  parent_platforms?: { platform: Platform }[];
  platforms?: { platform: Platform }[];
  genres?: Genre[];
  metacritic: number | null;
  rating: number;
  rating_top: number;
  ratings_count?: number;
  released?: string;
  playtime?: number;
  added?: number;
}

export interface GameDetail extends Game {
  description_raw?: string;
  website?: string;
  developers?: { id: number; name: string }[];
  publishers?: { id: number; name: string }[];
  stores?: { store: { id: number; name: string; domain?: string } }[];
}

export interface Screenshot {
  id: number;
  image: string;
}

export interface RawgList<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface DiscoverFilters {
  search: string;
  genre: string;
  platform: string;
  ordering: string;
  yearFrom: string;
  yearTo: string;
  minRating: number;
  minCritic: number;
  maxPlaytime: number;
  page: number;
}
