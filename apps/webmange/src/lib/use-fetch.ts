import { useCallback, useEffect, useState } from "react";
import { api } from "./api";

// tiny GET hook with reload(). ponytail: no react-query — one endpoint, one state.
export function useFetch<T>(path: string | null) {
  const [data, setData] = useState<T | undefined>(undefined);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(() => {
    if (!path) return;
    setLoading(true);
    api<T>(path)
      .then((d) => {
        setData(d);
        setError(null);
      })
      .catch((e) => setError(e.message ?? "error"))
      .finally(() => setLoading(false));
  }, [path]);

  useEffect(() => reload(), [reload]);
  return { data, error, loading, reload, setData };
}
