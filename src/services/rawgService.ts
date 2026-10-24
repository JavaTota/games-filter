import type { Game, GameDetail, Genre, Platform, RawgList, Screenshot } from "../types/game";

function toQuery(params: Record<string, string | number | boolean | undefined>) {
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== "") query.set(key, String(value));
  }
  return query;
}

/** Browser calls our Vercel proxy; the RAWG API key never enters the client bundle. */
async function rawgGet<T>(path: string, params: Record<string, string | number | boolean | undefined> = {}) {
  const query = toQuery({ path, ...params });
  const response = await fetch(`/api/rawg?${query.toString()}`);
  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || `RAWG request failed (${response.status}).`);
  }
  return response.json() as Promise<T>;
}

export const getGames = (params: Record<string, string | number | boolean | undefined>) => rawgGet<RawgList<Game>>("/games", params);
export const searchGames = (search: string) => rawgGet<RawgList<Game>>("/games", { search, page_size: 6, search_precise: true });
export const getGame = (id: number | string) => rawgGet<GameDetail>(`/games/${id}`);
export const getScreenshots = (id: number | string) => rawgGet<RawgList<Screenshot>>(`/games/${id}/screenshots`, { page_size: 8 });
export const getPlatforms = () => rawgGet<RawgList<Platform>>("/platforms/lists/parents", { page_size: 20 });
export const getGenres = () => rawgGet<RawgList<Genre>>("/genres", { page_size: 40 });
