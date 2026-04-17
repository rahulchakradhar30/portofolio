import type { Metadata } from "next";
import { Sora, Space_Grotesk } from "next/font/google";
import "./globals.css";
import Chatbot from "./components/Chatbot";
import CookieConsent from "./components/CookieConsent";
import { MotionProvider } from "./components/MotionProvider";
import AppShell from "./components/AppShell";
import DevtoolsGuard from "./components/DevtoolsGuard";

const sora = Sora({
  variable: "--font-sora",
  subsets: ["latin"],
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "PEREPOGU RAHUL CHAKRADHAR - AI Enthusiast | Tech Creator | Director",
  description: "Portfolio of PEREPOGU RAHUL CHAKRADHAR - AI enthusiast, tech learner, content creator, and director. Explore innovative projects in AI, IoT, filmmaking, and entrepreneurship.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${sora.variable} ${spaceGrotesk.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
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


