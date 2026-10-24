import { createContext, type ReactNode, useContext, useState } from "react";
import type { Game } from "../types/game";

const STORAGE_KEY = "gamefilter.compare";
interface CompareValue { games: Game[]; toggle: (game: Game) => string | null; clear: () => void; }
const CompareContext = createContext<CompareValue | null>(null);

function readStoredGames(): Game[] {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]") as Game[]; } catch { return []; }
}

/** Compare state persists locally so users can browse before opening the comparison table. */
export function CompareProvider({ children }: { children: ReactNode }) {
  const [games, setGames] = useState<Game[]>(readStoredGames);
  const commit = (next: Game[]) => { setGames(next); localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); };
  const toggle = (game: Game) => {
    if (games.some((item) => item.id === game.id)) { commit(games.filter((item) => item.id !== game.id)); return null; }
    if (games.length >= 3) return "You can compare up to 3 games at a time.";
    commit([...games, game]); return null;
  };
  return <CompareContext.Provider value={{ games, toggle, clear: () => commit([]) }}>{children}</CompareContext.Provider>;
}

export function useCompare() {
  const value = useContext(CompareContext);
  if (!value) throw new Error("useCompare must be used inside CompareProvider.");
  return value;
}
