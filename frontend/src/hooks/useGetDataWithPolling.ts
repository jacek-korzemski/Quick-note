import { useRef, useState, useCallback, useEffect } from "react";
import useGetData from "./useGetData";

export function useGetDataWithPolling<T = unknown>({
  apiUrl,
  enabled = true,
  pollingInterval = 0,
}: UseGetDataWithPollingOptions): UseGetDataResult<T> & { stopPolling: () => void; startPolling: () => void } {
  const result = useGetData<T>({ apiUrl, enabled });
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const [isPolling, setIsPolling] = useState(pollingInterval > 0);

  const stopPolling = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsPolling(false);
  }, []);

  const startPolling = useCallback(() => {
    if (pollingInterval > 0) {
      setIsPolling(true);
    }
  }, [pollingInterval]);

  useEffect(() => {
    if (enabled && isPolling && pollingInterval > 0) {
      intervalRef.current = setInterval(() => {
        result.refetch();
      }, pollingInterval);

      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
      };
    }
  }, [enabled, isPolling, pollingInterval, result.refetch]);

  return {
    ...result,
    stopPolling,
    startPolling,
  };
}

export default useGetDataWithPolling;