import type { Metadata } from "next";
import "./globals.css";
import ClientProviders from "./ClientProviders";
import { DIProvider } from '@/presentation/context/DIContext';
import Script from "next/script";
import Analytics from "@/presentation/components/analytics/Analytics";
import { Suspense } from "react";
import { cookies } from "next/headers";

export const metadata: Metadata = {
  title: "Portokalle",
  description: "Telemedicine Platform",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const gaId = process.env.NEXT_PUBLIC_GA_ID;
  let lang = 'en';
  if (typeof window === 'undefined') {
    // SSR: read cookie from headers
    const cookieStore = await cookies();
    lang = cookieStore.get('language')?.value || 'en';
  } else {
    // Client: read cookie from document
    lang = document.cookie.match(/language=([a-zA-Z-]+)/)?.[1] || 'en';
  }
  return (
    <html lang={lang} data-theme="light">
      <head>
        {gaId && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
              strategy="afterInteractive"
            />
            <Script id="gtag-init" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${gaId}');
              `}
            </Script>
          </>
        )}
      </head>
      <body className="bg-base-100 min-h-screen">
        <DIProvider>
          <ClientProviders>
            <Suspense fallback={null}>
              <Analytics />
            </Suspense>
            {children}
          </ClientProviders>
        </DIProvider>
      </body>
    </html>
  );
}
