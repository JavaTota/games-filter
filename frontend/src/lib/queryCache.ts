import { useCallback, useEffect, useRef, useState } from "react";

interface CacheEntry<T> {
  data?: T;
  expiresAt: number;
  promise?: Promise<T>;
}

interface QueryOptions {
  enabled?: boolean;
  ttlMs?: number;
}

const cache = new Map<string, CacheEntry<unknown>>();

export async function cachedQuery<T>(
  key: string,
  loader: () => Promise<T>,
  ttlMs = 5 * 60_000,
): Promise<T> {
  const cached = cache.get(key) as CacheEntry<T> | undefined;

  if (cached?.data !== undefined && cached.expiresAt > Date.now()) {
    return cached.data;
  }

  if (cached?.promise) {
    return cached.promise;
  }

  const request = loader()
    .then((data) => {
      cache.set(key, {
        data,
        expiresAt: Date.now() + ttlMs,
      });
      return data;
    })
    .catch((error) => {
      cache.delete(key);
      throw error;
    });

  cache.set(key, {
    ...cached,
    expiresAt: cached?.expiresAt ?? 0,
    promise: request,
  });

  return request;
}

export function invalidateQuery(prefix: string) {
  for (const key of cache.keys()) {
    if (key.startsWith(prefix)) {
      cache.delete(key);
    }
  }
}

export function useCachedQuery<T>(
  key: string,
  loader: () => Promise<T>,
  options: QueryOptions = {},
) {
  const enabled = options.enabled ?? true;
  const [data, setData] = useState<T>();
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState(enabled);
  const [revision, setRevision] = useState(0);
  const loaderRef = useRef(loader);

  useEffect(() => {
    loaderRef.current = loader;
  }, [loader]);

  useEffect(() => {
    let active = true;

    if (!enabled) {
      setIsLoading(false);
      return () => {
        active = false;
      };
    }

    setIsLoading(true);
    setError(null);

    cachedQuery(key, () => loaderRef.current(), options.ttlMs)
      .then((value) => {
        if (active) setData(value);
      })
      .catch((reason) => {
        if (!active) return;
        const nextError =
          reason instanceof Error ? reason : new Error(String(reason));
        setError(nextError);
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });

    return () => {
      active = false;
    };
  }, [enabled, key, options.ttlMs, revision]);

  const refetch = useCallback(() => {
    invalidateQuery(key);
    setRevision((current) => current + 1);
  }, [key]);

  return { data, error, isLoading, refetch };
}
