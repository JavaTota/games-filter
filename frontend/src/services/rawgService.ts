import type { Game, GameDetail, Genre, Platform, RawgList, Screenshot } from "../types/game";
import { apiRequest } from "./apiClient";

function toQuery(params: Record<string, string | number | boolean | undefined>) {
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== "") query.set(key, String(value));
  }
  return query;
}

/** RAWG traffic now passes through FastAPI; the browser never receives the provider key. */
async function rawgGet<T>(path: string, params: Record<string, string | number | boolean | undefined> = {}) {
  const query = toQuery({ path, ...params });
  return apiRequest<T>(`/api/rawg?${query.toString()}`);
}

export const getGames = (params: Record<string, string | number | boolean | undefined>) => rawgGet<RawgList<Game>>("/games", params);
export const searchGames = (search: string) => rawgGet<RawgList<Game>>("/games", { search, page_size: 6, search_precise: true });
export const getGame = (id: number | string) => rawgGet<GameDetail>(`/games/${id}`);
export const getScreenshots = (id: number | string) => rawgGet<RawgList<Screenshot>>(`/games/${id}/screenshots`, { page_size: 8 });
export const getPlatforms = () => rawgGet<RawgList<Platform>>("/platforms/lists/parents", { page_size: 20 });
export const getGenres = () => rawgGet<RawgList<Genre>>("/genres", { page_size: 40 });
