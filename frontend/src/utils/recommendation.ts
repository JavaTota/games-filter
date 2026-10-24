import type { DiscoverFilters, Game } from "../types/game";

/** Transparent 0-100 ranking: preferences add weight, while neutral filters add small baseline credit. */
export function calculateMatchScore(game: Game, filters: DiscoverFilters) {
  let score = 15;
  const genres = game.genres?.map((genre) => genre.slug) ?? [];
  const platforms = game.parent_platforms?.map((item) => String(item.platform.id)) ?? [];

  score += filters.genre ? (genres.includes(filters.genre) ? 20 : 0) : 8;
  score += filters.platform ? (platforms.includes(filters.platform) ? 15 : 0) : 5;
  score += filters.minRating ? (game.rating >= filters.minRating ? 12 : 0) : 5;
  score += filters.minCritic ? ((game.metacritic ?? 0) >= filters.minCritic ? 10 : 0) : 4;
  score += filters.maxPlaytime ? ((game.playtime ?? 0) <= filters.maxPlaytime ? 10 : 0) : 4;

  if (filters.yearFrom || filters.yearTo) {
    const year = game.released ? Number(game.released.slice(0, 4)) : 0;
    const from = Number(filters.yearFrom || 1980);
    const to = Number(filters.yearTo || new Date().getFullYear());
    if (year >= from && year <= to) score += 8;
  } else {
    score += 4;
  }

  if (game.metacritic) score += Math.min(7, Math.max(0, (game.metacritic - 60) / 5));
  score += Math.min(7, Math.max(0, (game.rating - 3) * 5));
  if ((game.added ?? 0) > 5000) score += 3;

  return Math.max(0, Math.min(100, Math.round(score)));
}
