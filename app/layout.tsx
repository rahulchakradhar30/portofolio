import type { Metadata } from "next";
import "./globals.css";
import Chatbot from "./components/Chatbot";
import CookieConsent from "./components/CookieConsent";
import { MotionProvider } from "./components/MotionProvider";
import AppShell from "./components/AppShell";
import DevtoolsGuard from "./components/DevtoolsGuard";

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
        <MotionProvider>
          <DevtoolsGuard />
          <AppShell>{children}</AppShell>
          <CookieConsent />
          <Chatbot />
        </MotionProvider>
      </body>
    </html>
  );
}


