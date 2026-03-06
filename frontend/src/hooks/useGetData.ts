import { useState, useEffect, useCallback, useRef } from 'react';

function useGetData<T = unknown>({
  apiUrl,
  enabled = true,
}: UseGetDataOptions): UseGetDataResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [status, setStatus] = useState<FetchStatus>('idle');
  const [error, setError] = useState<Error | null>(null);
  
  // Use ref to track if component is mounted
  const isMountedRef = useRef(true);
  
  // Track the current request to handle race conditions
  const currentRequestRef = useRef<AbortController | null>(null);

  const fetchData = useCallback(async () => {
    // Cancel any ongoing request
    if (currentRequestRef.current) {
      currentRequestRef.current.abort();
    }
    
    // Create new abort controller for this request
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

      // Only update state if component is still mounted and this is still the current request
      if (isMountedRef.current && currentRequestRef.current === abortController) {
        setData(result);
        setStatus('success');
      }
    } catch (err) {
      // Ignore abort errors
      if (err instanceof Error && err.name === 'AbortError') {
        return;
      }

      if (isMountedRef.current) {
        const error = err instanceof Error ? err : new Error('An unknown error occurred');
        setError(error);
        setStatus('error');
      }
    }
  }, [apiUrl]);

  const refetch = useCallback(async () => {
    await fetchData();
  }, [fetchData]);

  // Initial fetch and refetch when apiUrl changes
  useEffect(() => {
    if (enabled) {
      fetchData();
    } else {
      setStatus('idle');
    }
  }, [enabled, fetchData]);

  // Cleanup on unmount
  useEffect(() => {
    isMountedRef.current = true;
    
    return () => {
      isMountedRef.current = false;
      // Cancel any ongoing request on unmount
      if (currentRequestRef.current) {
        currentRequestRef.current.abort();
      }
    };
  }, []);

  return {
    data,
    isFetching: status === 'loading',
    isError: status === 'error',
    isSuccess: status === 'success',
    isIdle: status === 'idle',
    error,
    refetch,
  };
}

export default useGetData;