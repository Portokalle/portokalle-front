import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Portokalle",
  description: "Telemedicine Platform",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" data-theme="light">
      <body className="bg-base-100 min-h-screen">
        {children}
      </body>
    </html>
  );
}
