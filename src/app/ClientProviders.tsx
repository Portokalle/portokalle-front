'use client';

import { AuthProvider } from "@/presentation/context/AuthContext";
import { useSessionActivity } from "@/presentation/hooks/useSessionActivity";
import { LogoutSessionUseCase } from '@/application/use-cases/logoutSessionUseCase';
import { FirebaseSessionRepository } from '@/infrastructure/repositories/FirebaseSessionRepository';

export default function ClientProviders({ children }: { children: React.ReactNode }) {
  // Mount global idle/session activity tracker once on client
  function SessionActivityHost() {
    const sessionRepo = new FirebaseSessionRepository();
    const logoutSessionUseCase = new LogoutSessionUseCase(sessionRepo);
    useSessionActivity(logoutSessionUseCase);
    // nothing to render
    return null;
  }

  return (
    <AuthProvider>
      <SessionActivityHost />
      {children}
    </AuthProvider>
  );
}
