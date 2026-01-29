'use client';

import { AuthProvider } from "@/presentation/context/AuthContext";
import { useSessionActivity } from "@/presentation/hooks/useSessionActivity";
import { useDI } from "@/presentation/context/DIContext";

export default function ClientProviders({ children }: { children: React.ReactNode }) {
  // Mount global idle/session activity tracker once on client
  function SessionActivityHost() {
    const { logoutSessionUseCase, sessionGateway } = useDI();
    useSessionActivity(logoutSessionUseCase, sessionGateway);
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
