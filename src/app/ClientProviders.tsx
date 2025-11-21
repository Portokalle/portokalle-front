'use client';

import { AuthProvider } from "../context/AuthContext";
import { useSessionActivity } from "@/hooks/useSessionActivity";

export default function ClientProviders({ children }: { children: React.ReactNode }) {
  // Mount global idle/session activity tracker once on client
  function SessionActivityHost() {
    // Import here to avoid SSR issues
    const { LogoutSessionUseCase } = require('@/application/logoutSessionUseCase');
    const { FirebaseSessionRepository } = require('@/infrastructure/repositories/FirebaseSessionRepository');
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
