import type { Metadata } from "next";
import "./globals.css";
import CookieConsent from "./components/CookieConsent";
import { MotionProvider } from "./components/MotionProvider";
import AppShell from "./components/AppShell";
import DevtoolsGuard from "./components/DevtoolsGuard";
import PaperBackground from "./components/PaperBackground";
import { PortfolioContentProvider } from "./components/PortfolioContentProvider";
import { SITE_URL, SITE_NAME, PRIMARY_NAME, NAME_VARIATIONS, getGlobalJsonLdGraph } from "@/app/lib/seoSchemas";

export const metadata: Metadata = {
  metadataBase: new URL("https://rahulchakradhar.vercel.app"),
  title: {
    default: `${PRIMARY_NAME} | AI Engineer & Full Stack Developer`,
    template: `%s | ${SITE_NAME}`,
  },
  description: `Official portfolio of ${PRIMARY_NAME} (P Rahul Chakradhar) - AI Engineer, Full Stack Developer, and Student Researcher specializing in AI-powered systems and high-trust web applications.`,
  applicationName: SITE_NAME,
  authors: [{ name: PRIMARY_NAME, url: SITE_URL }],
  creator: PRIMARY_NAME,
  publisher: PRIMARY_NAME,
  keywords: [
    ...NAME_VARIATIONS,
    "AI Engineer",
    "Full Stack Developer",
    "AI/ML Engineer",
    "Software Developer",
    "Student Researcher",
    "Rahul Chakradhar Portfolio",
    "Next.js Portfolio",
    "React Engineer",
    "TypeScript Developer",
  ],
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon.svg", type: "image/svg+xml" },
    ],
    apple: [{ url: "/icon.svg", type: "image/svg+xml" }],
  },
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    title: `${PRIMARY_NAME} | AI Engineer & Full Stack Developer`,
    description: `Official portfolio of ${PRIMARY_NAME} - AI Engineer, Full Stack Developer, and Student Researcher.`,
    url: SITE_URL,
    locale: "en_US",
    images: [
      {
        url: "/api/og",
        width: 1200,
        height: 630,
        alt: `${PRIMARY_NAME} Portfolio`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${PRIMARY_NAME} | AI Engineer & Full Stack Developer`,
    description: `Official portfolio of ${PRIMARY_NAME} - AI Engineer & Full Stack Developer.`,
    site: "@rahulchakradhar",
    creator: "@rahulchakradhar",
    images: ["/api/og"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: SITE_URL,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const globalJsonLd = getGlobalJsonLdGraph();

  return (
    <html lang="en" className="h-full antialiased" suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(globalJsonLd) }}
        />
      </head>
      <body className="min-h-full flex flex-col bg-[var(--background)] text-[var(--foreground)]">
        <PortfolioContentProvider>
          <MotionProvider>
            <PaperBackground />
            <DevtoolsGuard />
            <AppShell>{children}</AppShell>
            <CookieConsent />
          </MotionProvider>
        </PortfolioContentProvider>
      </body>
    </html>
  );
}
