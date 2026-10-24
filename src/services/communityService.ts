import type { LibraryEntry, Review } from "../types/community";
import { supabaseRest } from "./supabaseClient";

export async function getReviews(gameId: number) {
  return supabaseRest<Review[]>(`reviews?game_id=eq.${gameId}&select=*&order=updated_at.desc`);
}

export async function saveReview(review: Omit<Review, "id" | "created_at" | "updated_at">) {
  return supabaseRest<Review[]>("reviews?on_conflict=user_id,game_id", {
    method: "POST",
    headers: { Prefer: "resolution=merge-duplicates,return=representation" },
    body: JSON.stringify(review),
  }, true);
}

export async function deleteReview(reviewId: number) {
  return supabaseRest<void>(`reviews?id=eq.${reviewId}`, { method: "DELETE", headers: { Prefer: "return=minimal" } }, true);
}

export async function getLibrary() {
  return supabaseRest<LibraryEntry[]>("library_entries?select=*&order=updated_at.desc", {}, true);
}

export async function getLibraryEntry(gameId: number) {
  return supabaseRest<LibraryEntry[]>(`library_entries?game_id=eq.${gameId}&select=*`, {}, true);
}

export async function saveLibraryEntry(entry: Omit<LibraryEntry, "id" | "created_at" | "updated_at">) {
  return supabaseRest<LibraryEntry[]>("library_entries?on_conflict=user_id,game_id", {
    method: "POST",
    headers: { Prefer: "resolution=merge-duplicates,return=representation" },
    body: JSON.stringify(entry),
  }, true);
}

export async function deleteLibraryEntry(gameId: number) {
  return supabaseRest<void>(`library_entries?game_id=eq.${gameId}`, { method: "DELETE", headers: { Prefer: "return=minimal" } }, true);
}
