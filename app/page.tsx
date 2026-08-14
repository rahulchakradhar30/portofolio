import type { Metadata, Viewport } from "next";
import serverFirebaseHelpers from "@/app/lib/firebaseServer";
import type { PortfolioContent } from "@/app/lib/types";
import { SITE_URL, SITE_NAME, PRIMARY_NAME, NAME_VARIATIONS } from "@/app/lib/seoSchemas";
import IntroOverlay from "./components/IntroOverlay";

export const dynamic = "force-dynamic";

export async function generateViewport(): Promise<Viewport> {
  const content = (await serverFirebaseHelpers.getPortfolioContent()) as PortfolioContent | null;
  return {
    themeColor: content?.seoThemeColor || "#2f241b",
    width: "device-width",
    initialScale: 1,
    maximumScale: 5,
  };
}

export async function generateMetadata(): Promise<Metadata> {
  const content = (await serverFirebaseHelpers.getPortfolioContent()) as PortfolioContent | null;

  const defaultTitle = "Rahul Chakradhar | AI/ML Engineer & Full Stack Developer";
  const defaultDescription =
    "Portfolio of Rahul Chakradhar — AI/ML student, Full Stack Developer, and Creative Technologist building AI-powered digital products, web experiences, and innovative technology projects.";

  const title = content?.seoTitle || defaultTitle;
  const description = content?.seoDescription || defaultDescription;
  
  const keywords = content?.seoKeywords
    ? content.seoKeywords.split(',').map((k: string) => k.trim())
    : [
        ...NAME_VARIATIONS,
        "AI Engineer",
        "Full Stack Developer",
        "AI/ML Engineer",
        "Rahul Chakradhar Portfolio",
        "AI Systems",
        "Next.js Developer",
        "Software Engineer",
      ];

  const ogImage = content?.seoOgImage || `${SITE_URL}/icon.svg`;
  const canonicalUrl = (content?.seoCanonicalUrl && !content.seoCanonicalUrl.includes('portofolio-one-dun-27') && !content.seoCanonicalUrl.includes('rahulchakradhar.com'))
    ? content.seoCanonicalUrl
    : SITE_URL;

  return {
    title,
    description,
    keywords,
    applicationName: SITE_NAME,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      type: "website",
      siteName: SITE_NAME,
      title,
      description,
      url: canonicalUrl,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: `${PRIMARY_NAME} Portfolio Preview`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
      site: "@rahulchakradhar",
      creator: "@rahulchakradhar",
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

import ThemeRenderer from "./components/ThemeRenderer";
import { normalizeHomepageConfig } from "@/app/lib/homepageConfig";

export default async function Home() {
  const content = (await serverFirebaseHelpers.getPortfolioContent()) as PortfolioContent | null;
  const homepageConfig = normalizeHomepageConfig(content?.homepageConfig);

  // Render visible sections in order
  const activeSections = homepageConfig.sections.filter((sec) => sec.visible !== false);

  return (
    <main>
      <IntroOverlay>
        <ThemeRenderer initialSections={activeSections} />
      </IntroOverlay>
    </main>
  );
}
