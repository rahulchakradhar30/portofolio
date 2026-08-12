import type { Metadata } from "next";
import serverFirebaseHelpers from "@/app/lib/firebaseServer";
import type { PortfolioContent } from "@/app/lib/types";
import { SITE_URL, SITE_NAME, PRIMARY_NAME, NAME_VARIATIONS } from "@/app/lib/seoSchemas";
import Header from "./components/Header";
import Footer from "./components/Footer";
import IntroOverlay from "./components/IntroOverlay";
import SectionRenderer from "./components/SectionRenderer";

export const dynamic = "force-dynamic";

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
    themeColor: content?.seoThemeColor || "#2f241b",
    robots: {
      index: true,
      follow: true,
    },
  };
}

export default function Home() {
  return (
    <main>
      <IntroOverlay>
        <Header />
        <SectionRenderer />
        <Footer />
      </IntroOverlay>
    </main>
  );
}
