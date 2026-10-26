import { type ReactNode, useState } from "react";

import type { Game } from "../types/game";
import { CompareContext } from "./compareContext";

const STORAGE_KEY = "gamemaster.compare";
const MAX_COMPARE_GAMES = 3;

function readStoredGames(): Game[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? (JSON.parse(stored) as Game[]) : [];
  } catch {
    return [];
  }
}

export function CompareProvider({ children }: { children: ReactNode }) {
  const [games, setGames] = useState<Game[]>(readStoredGames);

  const saveGames = (nextGames: Game[]) => {
    setGames(nextGames);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(nextGames));
  };

  const toggle = (game: Game) => {
    const alreadySelected = games.some((item) => item.id === game.id);

    if (alreadySelected) {
      saveGames(games.filter((item) => item.id !== game.id));
      return null;
    }

    if (games.length >= MAX_COMPARE_GAMES) {
      return `You can compare up to ${MAX_COMPARE_GAMES} games at a time.`;
    }

    saveGames([...games, game]);
    return null;
  };

  return (
    <CompareContext.Provider
      value={{ games, toggle, clear: () => saveGames([]) }}
    >
      {children}
    </CompareContext.Provider>
  );
}
