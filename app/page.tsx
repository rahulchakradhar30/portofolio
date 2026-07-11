import type { Metadata } from "next";
import serverFirebaseHelpers from "@/app/lib/firebaseServer";
import type { PortfolioContent } from "@/app/lib/types";
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
  if (!content) return {};

  const title = content.seoTitle || "Rahul Chakradhar | AI Systems, Storytelling & Impact";
  const description = content.seoDescription || "Premium portfolio for Rahul Chakradhar, focused on AI-powered systems, product thinking, storytelling, and high-trust digital experiences.";
  const keywords = content.seoKeywords ? content.seoKeywords.split(',').map((k: string) => k.trim()) : undefined;

  return {
    title,
    description,
    keywords,
    alternates: {
      canonical: content.seoCanonicalUrl || undefined,
    },
    openGraph: {
      title,
      description,
      images: content.seoOgImage ? [{ url: content.seoOgImage }] : [],
    },
    themeColor: content.seoThemeColor || undefined,
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
