import type {
  Game,
  GameDetail,
  Genre,
  Platform,
  RawgList,
  Screenshot,
} from "../types/game";
import { apiRequest } from "./apiClient";

type RawgParams = Record<string, string | number | boolean | undefined>;

function buildQuery(params: RawgParams) {
  const query = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === "") continue;
    query.set(key, String(value));
  }

  return query.toString();
}

async function getFromRawg<T>(path: string, params: RawgParams = {}) {
  const query = buildQuery({ path, ...params });
  return apiRequest<T>(`/api/rawg?${query}`);
}

export function getGames(params: RawgParams) {
  return getFromRawg<RawgList<Game>>("/games", params);
}

export function searchGames(search: string) {
  return getFromRawg<RawgList<Game>>("/games", {
    search,
    page_size: 6,
    search_precise: true,
  });
}

export function getGame(id: number | string) {
  return getFromRawg<GameDetail>(`/games/${id}`);
}

export function getScreenshots(id: number | string) {
  return getFromRawg<RawgList<Screenshot>>(`/games/${id}/screenshots`, {
    page_size: 8,
  });
}

export function getPlatforms() {
  return getFromRawg<RawgList<Platform>>("/platforms/lists/parents", {
    page_size: 20,
  });
}

export function getGenres() {
  return getFromRawg<RawgList<Genre>>("/genres", { page_size: 40 });
}
