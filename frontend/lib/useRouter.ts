import { useContext } from "react";

import { RouterContext } from "./routerContext";

export function useRouter() {
  const router = useContext(RouterContext);

  if (!router) {
    throw new Error("useRouter must be used inside RouterProvider.");
  }

  return router;
}
