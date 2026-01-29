import { useEffect } from 'react';
import { useSessionStore } from '@/presentation/store/sessionStore';
import { LogoutSessionUseCase } from '@/application/use-cases/logoutSessionUseCase';
import type { ISessionGateway } from '@/application/ports/ISessionGateway';

// Thin hook that delegates all logic to the centralized Zustand store
export function useSessionActivity(logoutSessionUseCase: LogoutSessionUseCase, sessionGateway?: ISessionGateway) {
  const init = useSessionStore((s) => s.initMonitor);
  const stop = useSessionStore((s) => s.stopMonitor);

  useEffect(() => {
    init(logoutSessionUseCase, sessionGateway);
    return () => stop();
  }, [init, stop, logoutSessionUseCase, sessionGateway]);
}
