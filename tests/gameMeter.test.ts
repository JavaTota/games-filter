import test from "node:test";
import assert from "node:assert/strict";
import { summarizeReviews } from "../src/utils/gameMeter.ts";
import type { Review } from "../src/types/community.ts";

const reviews: Review[] = [
  { id: 1, user_id: "a", game_id: 10, game_name: "Game", display_name: "A", score: 8, recommended: true, body: "Strong game overall.", created_at: "", updated_at: "" },
  { id: 2, user_id: "b", game_id: 10, game_name: "Game", display_name: "B", score: 6, recommended: false, body: "Good, but not for me.", created_at: "", updated_at: "" },
];

test("GameMeter converts 1-10 reviews to a 0-100 score", () => {
  assert.deepEqual(summarizeReviews(reviews), { score: 70, recommendedPercent: 50, reviewCount: 2 });
});

test("GameMeter handles an empty review set", () => {
  assert.deepEqual(summarizeReviews([]), { score: 0, recommendedPercent: 0, reviewCount: 0 });
});
