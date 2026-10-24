import {
  createContext,
  type ReactNode,
  useContext,
  useState,
} from "react";

import type { Game } from "../types/game";

const STORAGE_KEY = "gamefilter.compare";
const MAX_COMPARE_GAMES = 3;

interface CompareValue {
  games: Game[];
  toggle: (game: Game) => string | null;
  clear: () => void;
}

const CompareContext = createContext<CompareValue | null>(null);

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

export function useCompare() {
  const compare = useContext(CompareContext);

  if (!compare) {
    throw new Error("useCompare must be used inside CompareProvider.");
  }

  return compare;
}
