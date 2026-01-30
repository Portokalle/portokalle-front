'use client';

import { AuthProvider } from "@/presentation/context/AuthContext";
import { useSessionActivity } from "@/presentation/hooks/useSessionActivity";
import { useDI } from "@/presentation/context/DIContext";
import { GoogleReCaptchaProvider } from "react-google-recaptcha-v3";

export default function ClientProviders({ children }: { children: React.ReactNode }) {
  // Mount global idle/session activity tracker once on client
  function SessionActivityHost() {
    const { logoutSessionUseCase, sessionGateway } = useDI();
    useSessionActivity(logoutSessionUseCase, sessionGateway);
    // nothing to render
    return null;
  }
  const recaptchaKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;

  return (
    <AuthProvider>
      <SessionActivityHost />
      {recaptchaKey ? (
        <GoogleReCaptchaProvider
          reCaptchaKey={recaptchaKey}
          scriptProps={{ async: true, appendTo: "head" }}
        >
          {children}
        </GoogleReCaptchaProvider>
      ) : (
        children
      )}
    </AuthProvider>
  );
}
