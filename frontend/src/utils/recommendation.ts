import type { DiscoverFilters, Game } from "../types/game";

export function calculateMatchScore(game: Game, filters: DiscoverFilters) {
  let score = 15;

  const genres = game.genres?.map((genre) => genre.slug) ?? [];
  const platforms =
    game.parent_platforms?.map(({ platform }) => String(platform.id)) ?? [];

  if (filters.genre) {
    if (genres.includes(filters.genre)) score += 20;
  } else {
    score += 8;
  }

  if (filters.platform) {
    if (platforms.includes(filters.platform)) score += 15;
  } else {
    score += 5;
  }

  if (filters.minRating) {
    if (game.rating >= filters.minRating) score += 12;
  } else {
    score += 5;
  }

  if (filters.minCritic) {
    if ((game.metacritic ?? 0) >= filters.minCritic) score += 10;
  } else {
    score += 4;
  }

  if (filters.maxPlaytime) {
    if ((game.playtime ?? 0) <= filters.maxPlaytime) score += 10;
  } else {
    score += 4;
  }

  if (filters.yearFrom || filters.yearTo) {
    const year = game.released ? Number(game.released.slice(0, 4)) : 0;
    const firstYear = Number(filters.yearFrom || 1980);
    const lastYear = Number(filters.yearTo || new Date().getFullYear());

    if (year >= firstYear && year <= lastYear) score += 8;
  } else {
    score += 4;
  }

  if (game.metacritic) {
    score += Math.min(7, Math.max(0, (game.metacritic - 60) / 5));
  }

  score += Math.min(7, Math.max(0, (game.rating - 3) * 5));

  if ((game.added ?? 0) > 5000) score += 3;

  return Math.max(0, Math.min(100, Math.round(score)));
}
