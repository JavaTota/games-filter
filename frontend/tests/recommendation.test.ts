import test from "node:test";
import assert from "node:assert/strict";
import { calculateMatchScore } from "../src/utils/recommendation.ts";
import type { DiscoverFilters, Game } from "../src/types/game.ts";

const filters: DiscoverFilters = {
  search: "",
  genre: "rpg",
  platform: "1",
  ordering: "-rating",
  yearFrom: "",
  yearTo: "",
  minRating: 4,
  minCritic: 80,
  maxPlaytime: 100,
  page: 1,
};

const matchingGame: Game = {
  id: 1,
  slug: "example",
  name: "Example",
  background_image: null,
  parent_platforms: [{ platform: { id: 1, name: "PC", slug: "pc" } }],
  genres: [{ id: 4, name: "RPG", slug: "rpg" }],
  metacritic: 90,
  rating: 4.5,
  rating_top: 5,
  playtime: 50,
  added: 10000,
  released: "2024-01-01",
};

test("recommendation score rewards matching preferences", () => {
  assert.ok(calculateMatchScore(matchingGame, filters) >= 90);
});

test("recommendation score stays inside 0-100", () => {
  assert.equal(calculateMatchScore({ ...matchingGame, rating: 5, metacritic: 100 }, filters), 100);
});
