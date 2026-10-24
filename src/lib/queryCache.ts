import { useCallback, useEffect, useRef, useState } from "react";

interface CacheEntry<T> {
  data?: T;
  expiresAt: number;
  promise?: Promise<T>;
}

const cache = new Map<string, CacheEntry<unknown>>();

/** Deduplicates concurrent requests and reuses fresh API data across page navigation. */
export async function cachedQuery<T>(key: string, loader: () => Promise<T>, ttlMs = 5 * 60_000): Promise<T> {
  const existing = cache.get(key) as CacheEntry<T> | undefined;
  if (existing?.data !== undefined && existing.expiresAt > Date.now()) return existing.data;
  if (existing?.promise) return existing.promise;

  const promise = loader().then((data) => {
    cache.set(key, { data, expiresAt: Date.now() + ttlMs });
    return data;
  }).catch((error) => {
    cache.delete(key);
    throw error;
  });

  cache.set(key, { ...existing, expiresAt: existing?.expiresAt ?? 0, promise });
  return promise;
}

export function invalidateQuery(prefix: string) {
  for (const key of cache.keys()) if (key.startsWith(prefix)) cache.delete(key);
}

/** React hook wraps the cache with loading/error state; disabled queries stay idle. */
export function useCachedQuery<T>(key: string, loader: () => Promise<T>, options?: { enabled?: boolean; ttlMs?: number }) {
  const enabled = options?.enabled ?? true;
  const [data, setData] = useState<T | undefined>();
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState(enabled);
  const [revision, setRevision] = useState(0);
  const loaderRef = useRef(loader);

  useEffect(() => { loaderRef.current = loader; }, [loader]);

  useEffect(() => {
    let active = true;
    if (!enabled) {
      setIsLoading(false);
      return () => { active = false; };
    }

    setIsLoading(true);
    setError(null);
    cachedQuery(key, () => loaderRef.current(), options?.ttlMs)
      .then((value) => { if (active) setData(value); })
      .catch((reason) => { if (active) setError(reason instanceof Error ? reason : new Error(String(reason))); })
      .finally(() => { if (active) setIsLoading(false); });

    return () => { active = false; };
  }, [key, enabled, options?.ttlMs, revision]);

  const refetch = useCallback(() => {
    invalidateQuery(key);
    setRevision((value) => value + 1);
  }, [key]);

  return { data, error, isLoading, refetch };
}
