'use client';
import { useEffect, useMemo, useRef, useState } from 'react';

// Call with a stable resolver and memoized request. Keep at most one running
// request and the latest pending request; obsolete results never reach the UI.
export function useWorkerRequest<P, T>(
  resolve: (params: P) => Promise<T>,
  params: P,
  { keepPreviousData = false }: { keepPreviousData?: boolean } = {},
) {
  const [attempt, setAttempt] = useState(0);
  const token = useMemo(() => ({ params, attempt }), [params, attempt]);
  const [result, setResult] = useState<{
    token: typeof token;
    data?: T;
    error?: string;
  }>();
  const queue = useRef<{
    running: boolean;
    latest?: typeof token;
    pending?: typeof token;
  }>({ running: false });

  useEffect(() => {
    const current = queue.current;
    current.latest = token;
    current.pending = token;
    async function drain() {
      if (current.running) return;
      current.running = true;
      try {
        while (current.pending) {
          const next = current.pending;
          current.pending = undefined;
          try {
            const data = await resolve(next.params);
            if (current.latest === next) setResult({ token: next, data });
          } catch (error) {
            if (current.latest === next) {
              setResult({
                token: next,
                error:
                  error instanceof Error ? error.message : 'Request failed.',
              });
            }
          }
        }
      } finally {
        current.running = false;
      }
    }
    void drain();
    return () => {
      if (current.latest === token) current.latest = undefined;
      if (current.pending === token) current.pending = undefined;
    };
  }, [resolve, token]);

  const settled = result?.token === token;
  return {
    data: settled || keepPreviousData ? result?.data : undefined,
    error: settled ? result.error : undefined,
    loading: !settled,
    retry: () => setAttempt((value) => value + 1),
  };
}
