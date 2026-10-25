import {
  type MouseEvent,
  type ReactNode,
  useEffect,
  useState,
} from "react";

import { RouterContext } from "./routerContext";
import { useRouter } from "./useRouter";

interface LinkProps {
  to: string;
  children: ReactNode;
  className?: string;
  ariaLabel?: string;
}

function getCurrentLocation() {
  return {
    pathname: window.location.pathname,
    search: window.location.search,
  };
}

export function RouterProvider({ children }: { children: ReactNode }) {
  const [location, setLocation] = useState(getCurrentLocation);

  useEffect(() => {
    const handlePopState = () => setLocation(getCurrentLocation());

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  const navigate = (to: string, replace = false) => {
    if (replace) {
      window.history.replaceState({}, "", to);
    } else {
      window.history.pushState({}, "", to);
    }

    setLocation(getCurrentLocation());
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <RouterContext.Provider value={{ ...location, navigate }}>
      {children}
    </RouterContext.Provider>
  );
}

export function AppLink({
  to,
  children,
  className,
  ariaLabel,
}: LinkProps) {
  const { navigate } = useRouter();

  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    const openNormally =
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey;

    if (openNormally) return;

    event.preventDefault();
    navigate(to);
  };

  return (
    <a
      href={to}
      className={className}
      aria-label={ariaLabel}
      onClick={handleClick}
    >
      {children}
    </a>
  );
}
