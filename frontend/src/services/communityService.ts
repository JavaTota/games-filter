import type { LibraryEntry, LibraryEntryInput, ReviewBundle } from "../types/community";
import { apiRequest } from "./apiClient";

export const getReviews = (gameId: number) => apiRequest<ReviewBundle>(`/api/games/${gameId}/reviews`);

export const saveReview = (
  gameId: number,
  review: { game_name: string; score: number; recommended: boolean; body: string },
) => apiRequest(`/api/games/${gameId}/review`, { method: "PUT", body: JSON.stringify(review) }, true);

export const deleteReview = (gameId: number) => apiRequest<void>(`/api/games/${gameId}/review`, { method: "DELETE" }, true);

export const setReviewHelpful = (reviewId: number, helpful: boolean) => apiRequest<void>(
  `/api/reviews/${reviewId}/helpful`,
  { method: helpful ? "PUT" : "DELETE" },
  true,
);

export const getLibrary = () => apiRequest<LibraryEntry[]>("/api/library", {}, true);
export const getLibraryEntry = (gameId: number) => apiRequest<LibraryEntry | null>(`/api/library/${gameId}`, {}, true);
export const saveLibraryEntry = (gameId: number, entry: LibraryEntryInput) => apiRequest<LibraryEntry>(
  `/api/library/${gameId}`,
  { method: "PUT", body: JSON.stringify(entry) },
  true,
);
export const deleteLibraryEntry = (gameId: number) => apiRequest<void>(`/api/library/${gameId}`, { method: "DELETE" }, true);
