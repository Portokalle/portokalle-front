import { useEffect } from 'react';
import { useSessionStore } from '@/store/sessionStore';

// Thin hook that delegates all logic to the centralized Zustand store
export function useSessionActivity() {
  const init = useSessionStore((s) => s.initMonitor);
  const stop = useSessionStore((s) => s.stopMonitor);

  useEffect(() => {
    init();
    return () => stop();
  }, [init, stop]);
}
