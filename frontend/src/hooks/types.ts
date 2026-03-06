interface UseGetDataOptions {
  apiUrl: string;
  enabled?: boolean;
}

interface UseGetDataResult<T> {
  data: T | null;
  isFetching: boolean;
  isError: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
  isSuccess: boolean;
  isIdle: boolean;
}

type FetchStatus = 'idle' | 'loading' | 'success' | 'error';

interface UseGetDataWithPollingOptions extends UseGetDataOptions {
  pollingInterval?: number; // in milliseconds, 0 to disable
}

interface UseGetDataCachedOptions extends UseGetDataOptions {
  cacheTime?: number; // in milliseconds
  staleTime?: number; // in milliseconds
}