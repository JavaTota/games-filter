import { type ReactNode, useState } from "react";

import { CompareContext } from "./compareContext";
import type { Game } from "../types/game";

const STORAGE_KEY = "gamefilter.compare";
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

  const clear = () => saveGames([]);

  return (
    <CompareContext.Provider value={{ games, toggle, clear }}>
      {children}
    </CompareContext.Provider>
  );
}
