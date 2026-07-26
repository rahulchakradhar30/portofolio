import type { Metadata } from "next";
import serverFirebaseHelpers from "@/app/lib/firebaseServer";
import type { PortfolioContent } from "@/app/lib/types";
import { SITE_URL, SITE_NAME, PRIMARY_NAME, NAME_VARIATIONS } from "@/app/lib/seoSchemas";
import Header from "./components/Header";
import Hero from "./components/Hero";
import About from "./components/About";
import StudyRoadmap from "./components/StudyRoadmap";
import PortfolioRadar from "./components/PortfolioRadar";
import Skills from "./components/Skills";
import Projects from "./components/Projects";
import Certifications from "./components/Certifications";
import Contact from "./components/Contact";
import Footer from "./components/Footer";
import SectionErrorBoundary from "./components/SectionErrorBoundary";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const content = (await serverFirebaseHelpers.getPortfolioContent()) as PortfolioContent | null;

  const title = content?.seoTitle || `${PRIMARY_NAME} | AI Engineer, Full Stack Developer & Researcher`;
  const description =
    content?.seoDescription ||
    `Official portfolio of ${PRIMARY_NAME} (P Rahul Chakradhar, Rahul Chakradhar) - AI Engineer, Full Stack Developer, and Student Researcher building AI systems and high-impact software.`;
  
  const keywords = content?.seoKeywords
    ? content.seoKeywords.split(',').map((k: string) => k.trim())
    : [
        ...NAME_VARIATIONS,
        "AI Engineer",
        "Full Stack Developer",
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
      <Header />
      <section id="home">
        <SectionErrorBoundary sectionName="Hero">
          <Hero />
        </SectionErrorBoundary>
      </section>
      <section id="about">
        <SectionErrorBoundary sectionName="About">
          <About />
        </SectionErrorBoundary>
      </section>
      <section id="roadmap">
        <SectionErrorBoundary sectionName="StudyRoadmap">
          <StudyRoadmap />
        </SectionErrorBoundary>
      </section>
      <section id="radar">
        <SectionErrorBoundary sectionName="PortfolioRadar">
          <PortfolioRadar />
        </SectionErrorBoundary>
      </section>
      <section id="skills">
        <SectionErrorBoundary sectionName="Skills">
          <Skills />
        </SectionErrorBoundary>
      </section>
      <section id="projects">
        <SectionErrorBoundary sectionName="Projects">
          <Projects />
        </SectionErrorBoundary>
      </section>
      <section id="certifications">
        <SectionErrorBoundary sectionName="Certifications">
          <Certifications />
        </SectionErrorBoundary>
      </section>
      <section id="contact">
        <SectionErrorBoundary sectionName="Contact">
          <Contact />
        </SectionErrorBoundary>
      </section>
      <Footer />
    </main>
  );
}
