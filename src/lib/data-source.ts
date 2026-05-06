import { useEffect, useRef, useState } from 'react';
import type { ProgressData } from './types';
import { fetchProgress } from '../../server/routes/api/progress';
import { fetchWatchToken } from '../../server/routes/api/watch';

const POLL_INTERVAL_MS = 2000;

/**
 * React hook for fetching and auto-refreshing progress.yaml data.
 *
 * Calls the server function to load the parsed ProgressData.
 * Polls the file mtime every 2s; re-fetches data when the file changes.
 */
export function useProgressData(path?: string) {
  const [data, setData] = useState<ProgressData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const lastMtimeRef = useRef<number | null>(null);

  const load = async () => {
    try {
      setLoading(true);
      const result = await fetchProgress({ data: path ? { path } : {} });
      if (result.error) {
        setError(result.error);
        setData(null);
      } else {
        setData(result.data);
        setError(null);
      }
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Initial load
    void load();

    // Polling: check mtime every POLL_INTERVAL_MS; reload on change
    const intervalId = setInterval(async () => {
      try {
        const result = await fetchWatchToken({ data: path ? { path } : {} });
        if (result.mtime !== null) {
          if (
            lastMtimeRef.current !== null &&
            lastMtimeRef.current !== result.mtime
          ) {
            void load();
          }
          lastMtimeRef.current = result.mtime;
        }
      } catch {
        // Silently ignore polling errors — data remains stale
      }
    }, POLL_INTERVAL_MS);

    return () => clearInterval(intervalId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [path]);

  return { data, error, loading, reload: load };
}
