import { createContext } from "react";

export interface RouterValue {
  pathname: string;
  search: string;
  navigate: (to: string, replace?: boolean) => void;
}

export const RouterContext = createContext<RouterValue | null>(null);
