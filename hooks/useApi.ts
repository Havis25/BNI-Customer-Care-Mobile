// hooks/useApi.ts
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { api } from "@/lib/api";

export function useApi<T>(path: string | null) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState<boolean>(!!path);
  const [error, setError] = useState<Error | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const fetcher = useCallback(async () => {
    if (!path) return;
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    setLoading(true);
    setError(null);
    try {
      const json = await api<T>(path, {}, controller.signal);
      setData(json);
    } catch (e: any) {
      if (e.name !== "AbortError") setError(e);
    } finally {
      setLoading(false);
    }
  }, [path]);

  useEffect(() => {
    fetcher();
    return () => abortRef.current?.abort();
  }, [fetcher]);

  const refetch = useCallback(() => fetcher(), [fetcher]);

  return useMemo(() => ({ data, loading, error, refetch }), [data, loading, error, refetch]);
}
