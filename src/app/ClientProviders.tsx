'use client';

import { AuthProvider } from "../context/AuthContext";
import { useSessionActivity } from "@/hooks/useSessionActivity";
import { useEffect } from "react";

export default function ClientProviders({ children }: { children: React.ReactNode }) {
  // Mount global idle/session activity tracker once on client
  function SessionActivityHost() {
    useSessionActivity();
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
