import type {
  LibraryEntry,
  LibraryEntryInput,
  ReviewBundle,
} from "../types/community";
import { apiRequest } from "./apiClient";

interface ReviewInput {
  game_name: string;
  score: number;
  recommended: boolean;
  body: string;
}

export function getReviews(gameId: number) {
  return apiRequest<ReviewBundle>(`/api/games/${gameId}/reviews`);
}

export function saveReview(gameId: number, review: ReviewInput) {
  return apiRequest(
    `/api/games/${gameId}/review`,
    {
      method: "PUT",
      body: JSON.stringify(review),
    },
    true,
  );
}

export function deleteReview(gameId: number) {
  return apiRequest<void>(
    `/api/games/${gameId}/review`,
    { method: "DELETE" },
    true,
  );
}

export function setReviewHelpful(reviewId: number, helpful: boolean) {
  return apiRequest<void>(
    `/api/reviews/${reviewId}/helpful`,
    { method: helpful ? "PUT" : "DELETE" },
    true,
  );
}

export function getLibrary() {
  return apiRequest<LibraryEntry[]>("/api/library", {}, true);
}

export function getLibraryEntry(gameId: number) {
  return apiRequest<LibraryEntry | null>(`/api/library/${gameId}`, {}, true);
}

export function saveLibraryEntry(gameId: number, entry: LibraryEntryInput) {
  return apiRequest<LibraryEntry>(
    `/api/library/${gameId}`,
    {
      method: "PUT",
      body: JSON.stringify(entry),
    },
    true,
  );
}

export function deleteLibraryEntry(gameId: number) {
  return apiRequest<void>(
    `/api/library/${gameId}`,
    { method: "DELETE" },
    true,
  );
}
