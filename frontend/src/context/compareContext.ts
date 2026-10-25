import { createContext } from "react";

import type { Game } from "../types/game";

export interface CompareValue {
  games: Game[];
  toggle: (game: Game) => string | null;
  clear: () => void;
}

export const CompareContext = createContext<CompareValue | null>(null);
