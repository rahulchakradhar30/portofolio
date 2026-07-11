import type { Metadata } from "next";
import "./globals.css";
import CookieConsent from "./components/CookieConsent";
import { MotionProvider } from "./components/MotionProvider";
import AppShell from "./components/AppShell";
import DevtoolsGuard from "./components/DevtoolsGuard";
import { PortfolioContentProvider } from "./components/PortfolioContentProvider";

export const metadata: Metadata = {
  title: "Rahul Chakradhar | AI Systems, Storytelling & Impact",
  description: "Premium portfolio for Rahul Chakradhar, focused on AI-powered systems, product thinking, storytelling, and high-trust digital experiences.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-[var(--background)] text-[var(--foreground)]">
        <PortfolioContentProvider>
          <MotionProvider>
            <DevtoolsGuard />
            <AppShell>{children}</AppShell>
            <CookieConsent />
          </MotionProvider>
        </PortfolioContentProvider>
      </body>
    </html>
  );
}


