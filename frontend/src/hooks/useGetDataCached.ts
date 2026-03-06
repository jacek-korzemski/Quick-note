import { useState, useRef, useCallback, useEffect } from "react";

const cache = new Map<string, { data: unknown; timestamp: number }>();
const DEFAULT_CACHE_TIME = 5 * 60 * 1000; // 5 minutes

export function useGetDataCached<T = unknown>({
  apiUrl,
  enabled = true,
  cacheTime = DEFAULT_CACHE_TIME,
  staleTime = 0,
}: UseGetDataCachedOptions): UseGetDataResult<T> & { clearCache: () => void } {
  const [data, setData] = useState<T | null>(() => {
    const cached = cache.get(apiUrl);
    if (cached && Date.now() - cached.timestamp < cacheTime) {
      return cached.data as T;
    }
    return null;
  });
  
  const [status, setStatus] = useState<FetchStatus>(() => {
    const cached = cache.get(apiUrl);
    if (cached && Date.now() - cached.timestamp < cacheTime) {
      return 'success';
    }
    return 'idle';
  });
  
  const [error, setError] = useState<Error | null>(null);
  const isMountedRef = useRef(true);
  const currentRequestRef = useRef<AbortController | null>(null);

  const fetchData = useCallback(async (force = false) => {
    // Check cache first (unless force refresh)
    if (!force) {
      const cached = cache.get(apiUrl);
      if (cached && Date.now() - cached.timestamp < staleTime) {
        setData(cached.data as T);
        setStatus('success');
        return;
      }
    }

    if (currentRequestRef.current) {
      currentRequestRef.current.abort();
    }
    
    const abortController = new AbortController();
    currentRequestRef.current = abortController;

    setStatus('loading');
    setError(null);

    try {
      const response = await fetch(apiUrl, {
        signal: abortController.signal,
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      // Update cache
      cache.set(apiUrl, { data: result, timestamp: Date.now() });

      if (isMountedRef.current && currentRequestRef.current === abortController) {
        setData(result);
        setStatus('success');
      }
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        return;
      }

      if (isMountedRef.current) {
        const error = err instanceof Error ? err : new Error('An unknown error occurred');
        setError(error);
        setStatus('error');
      }
    }
  }, [apiUrl, staleTime]);

  const refetch = useCallback(async () => {
    await fetchData(true);
  }, [fetchData]);

  const clearCache = useCallback(() => {
    cache.delete(apiUrl);
  }, [apiUrl]);

  useEffect(() => {
    if (enabled) {
      fetchData();
    }
  }, [enabled, fetchData]);

  useEffect(() => {
    isMountedRef.current = true;
    
    return () => {
      isMountedRef.current = false;
      if (currentRequestRef.current) {
        currentRequestRef.current.abort();
      }
    };
  }, []);

  // Cleanup old cache entries periodically
  useEffect(() => {
    const cleanup = setInterval(() => {
      const now = Date.now();
      cache.forEach((value, key) => {
        if (now - value.timestamp > cacheTime) {
          cache.delete(key);
        }
      });
    }, cacheTime);

    return () => clearInterval(cleanup);
  }, [cacheTime]);

  return {
    data,
    isFetching: status === 'loading',
    isError: status === 'error',
    isSuccess: status === 'success',
    isIdle: status === 'idle',
    error,
    refetch,
    clearCache,
  };
}