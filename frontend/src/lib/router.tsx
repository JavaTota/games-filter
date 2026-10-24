import { createContext, type MouseEvent, type ReactNode, useContext, useEffect, useState } from "react";

interface RouterValue {
  pathname: string;
  search: string;
  navigate: (to: string, replace?: boolean) => void;
}

const RouterContext = createContext<RouterValue | null>(null);

function readLocation() {
  return { pathname: window.location.pathname, search: window.location.search };
}

/** Tiny History-API router keeps this project dependency-light while supporting real deep links. */
export function RouterProvider({ children }: { children: ReactNode }) {
  const [location, setLocation] = useState(readLocation);

  useEffect(() => {
    const onPopState = () => setLocation(readLocation());
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  const navigate = (to: string, replace = false) => {
    replace ? window.history.replaceState({}, "", to) : window.history.pushState({}, "", to);
    setLocation(readLocation());
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return <RouterContext.Provider value={{ ...location, navigate }}>{children}</RouterContext.Provider>;
}

export function useRouter() {
  const value = useContext(RouterContext);
  if (!value) throw new Error("useRouter must be used inside RouterProvider.");
  return value;
}

interface LinkProps {
  to: string;
  children: ReactNode;
  className?: string;
  ariaLabel?: string;
}

/** Internal links preserve SPA navigation while remaining normal accessible anchors. */
export function AppLink({ to, children, className, ariaLabel }: LinkProps) {
  const { navigate } = useRouter();
  const onClick = (event: MouseEvent<HTMLAnchorElement>) => {
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    navigate(to);
  };

  return <a href={to} onClick={onClick} className={className} aria-label={ariaLabel}>{children}</a>;
}
