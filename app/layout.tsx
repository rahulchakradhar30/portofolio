import type { Metadata, Viewport } from "next";
import "./globals.css";
import CookieConsent from "./components/CookieConsent";
import { MotionProvider } from "./components/MotionProvider";
import AppShell from "./components/AppShell";
import DevtoolsGuard from "./components/DevtoolsGuard";
import PaperBackground from "./components/PaperBackground";
import { PortfolioContentProvider } from "./components/PortfolioContentProvider";
import { NavigationProvider } from "./components/NavigationContext";
import { SITE_URL, SITE_NAME, PRIMARY_NAME, NAME_VARIATIONS, getGlobalJsonLdGraph } from "@/app/lib/seoSchemas";

// Explicit viewport export — required by Next.js 14+ for themeColor and other viewport controls
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#fdfbf7",
};

export const metadata: Metadata = {
  metadataBase: new URL("https://rahulchakradhar.vercel.app"),
  title: {
    default: "Rahul Chakradhar | AI/ML Engineer & Full Stack Developer",
    template: `%s | ${SITE_NAME}`,
  },
  description: "Portfolio of Rahul Chakradhar — AI/ML student, Full Stack Developer, and Creative Technologist building AI-powered digital products, web experiences, and innovative technology projects.",
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
      { url: "/api/favicon", type: "image/png" },
    ],
    apple: [{ url: "/favicon.ico" }],
  },
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    title: "Rahul Chakradhar | AI/ML Engineer & Full Stack Developer",
    description: "Portfolio of Rahul Chakradhar — AI/ML student, Full Stack Developer, and Creative Technologist building AI-powered digital products, web experiences, and innovative technology projects.",
    url: SITE_URL,
    locale: "en_US",
    images: [
      {
        // Absolute URL required for OG image crawlers to fetch reliably
        url: `${SITE_URL}/api/og`,
        width: 1200,
        height: 630,
        alt: `${PRIMARY_NAME} Portfolio`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Rahul Chakradhar | AI/ML Engineer & Full Stack Developer",
    description: "Portfolio of Rahul Chakradhar — AI/ML student, Full Stack Developer, and Creative Technologist building AI-powered digital products, web experiences, and innovative technology projects.",
    site: "@rahulchakradhar",
    creator: "@rahulchakradhar",
    // Absolute URL required for Twitter card image crawlers
    images: [`${SITE_URL}/api/og`],
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
      <body className="min-h-full flex flex-col bg-[var(--background)] text-[var(--foreground)]">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(globalJsonLd) }}
        />
        <PortfolioContentProvider>
          <MotionProvider>
            <PaperBackground />
            <DevtoolsGuard />
            <NavigationProvider>
              <AppShell>{children}</AppShell>
            </NavigationProvider>
            <CookieConsent />
          </MotionProvider>
        </PortfolioContentProvider>
      </body>
    </html>
  );
}
