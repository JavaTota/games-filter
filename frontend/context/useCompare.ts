import { useContext } from "react";

import { CompareContext } from "./compareContext";

export function useCompare() {
  const compare = useContext(CompareContext);

  if (!compare) {
    throw new Error("useCompare must be used inside CompareProvider.");
  }

  return compare;
}
