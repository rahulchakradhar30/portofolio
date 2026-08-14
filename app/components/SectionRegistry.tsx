"use client";

import React from "react";
import type { HomepageSectionConfig } from "@/app/lib/types";
import Hero from "./Hero";
import About from "./About";
import StudyRoadmap from "./StudyRoadmap";
import PortfolioRadar from "./PortfolioRadar";
import Skills from "./Skills";
import Projects from "./Projects";
import Certifications from "./Certifications";
import Contact from "./Contact";
import Experience from "./Experience";
import CustomSectionRenderer from "./blocks/CustomSectionRenderer";
import SectionErrorBoundary from "./SectionErrorBoundary";
import BlockRegistry from "./blocks/BlockRegistry";

export default function SectionRegistry({ section }: { section: HomepageSectionConfig }) {
  if (section.visible === false) return null;

  const extraBlocks = section.blocks && section.blocks.length > 0 ? section.blocks : [];

  switch (section.id) {
    case "hero":
      return (
        <section id="home" aria-labelledby="hero-heading" className="scroll-mt-28 sm:scroll-mt-32 lg:scroll-mt-36">
          <SectionErrorBoundary sectionName="Hero">
            <Hero />
            {extraBlocks.length > 0 && (
              <div className="mx-auto max-w-[1600px] px-4 sm:px-6 lg:px-14 pb-12 space-y-6">
                {extraBlocks.map((block) => (
                  <BlockRegistry key={block.id} block={block} />
                ))}
              </div>
            )}
          </SectionErrorBoundary>
        </section>
      );

    case "about":
      return (
        <section id="about" aria-labelledby="about-heading" className="scroll-mt-28 sm:scroll-mt-32 lg:scroll-mt-36">
          <SectionErrorBoundary sectionName="About">
            <About />
            {extraBlocks.length > 0 && (
              <div className="mx-auto max-w-[1600px] px-4 sm:px-6 lg:px-14 pb-12 space-y-6">
                {extraBlocks.map((block) => (
                  <BlockRegistry key={block.id} block={block} />
                ))}
              </div>
            )}
          </SectionErrorBoundary>
        </section>
      );

    case "roadmap":
      return (
        <section id="roadmap" aria-labelledby="roadmap-heading" className="scroll-mt-28 sm:scroll-mt-32 lg:scroll-mt-36">
          <SectionErrorBoundary sectionName="StudyRoadmap">
            <StudyRoadmap />
            {extraBlocks.length > 0 && (
              <div className="mx-auto max-w-[1600px] px-4 sm:px-6 lg:px-14 pb-12 space-y-6">
                {extraBlocks.map((block) => (
                  <BlockRegistry key={block.id} block={block} />
                ))}
              </div>
            )}
          </SectionErrorBoundary>
        </section>
      );

    case "radar":
      return (
        <section id="radar" aria-labelledby="radar-heading" className="scroll-mt-28 sm:scroll-mt-32 lg:scroll-mt-36">
          <SectionErrorBoundary sectionName="PortfolioRadar">
            <PortfolioRadar />
            {extraBlocks.length > 0 && (
              <div className="mx-auto max-w-[1600px] px-4 sm:px-6 lg:px-14 pb-12 space-y-6">
                {extraBlocks.map((block) => (
                  <BlockRegistry key={block.id} block={block} />
                ))}
              </div>
            )}
          </SectionErrorBoundary>
        </section>
      );

    case "experience":
      return (
        <SectionErrorBoundary sectionName="Experience">
          <Experience section={section} />
          {extraBlocks.length > 0 && (
            <div className="mx-auto max-w-[1600px] px-4 sm:px-6 lg:px-14 pb-12 space-y-6">
              {extraBlocks.map((block) => (
                <BlockRegistry key={block.id} block={block} />
              ))}
            </div>
          )}
        </SectionErrorBoundary>
      );

    case "skills":
      return (
        <section id="skills" aria-labelledby="skills-heading" className="scroll-mt-28 sm:scroll-mt-32 lg:scroll-mt-36">
          <SectionErrorBoundary sectionName="Skills">
            <Skills />
            {extraBlocks.length > 0 && (
              <div className="mx-auto max-w-[1600px] px-4 sm:px-6 lg:px-14 pb-12 space-y-6">
                {extraBlocks.map((block) => (
                  <BlockRegistry key={block.id} block={block} />
                ))}
              </div>
            )}
          </SectionErrorBoundary>
        </section>
      );

    case "projects":
      return (
        <section id="projects" aria-labelledby="projects-heading" className="scroll-mt-28 sm:scroll-mt-32 lg:scroll-mt-36">
          <SectionErrorBoundary sectionName="Projects">
            <Projects />
            {extraBlocks.length > 0 && (
              <div className="mx-auto max-w-[1600px] px-4 sm:px-6 lg:px-14 pb-12 space-y-6">
                {extraBlocks.map((block) => (
                  <BlockRegistry key={block.id} block={block} />
                ))}
              </div>
            )}
          </SectionErrorBoundary>
        </section>
      );

    case "certifications":
      return (
        <section id="certifications" aria-labelledby="certifications-heading" className="scroll-mt-28 sm:scroll-mt-32 lg:scroll-mt-36">
          <SectionErrorBoundary sectionName="Certifications">
            <Certifications />
            {extraBlocks.length > 0 && (
              <div className="mx-auto max-w-[1600px] px-4 sm:px-6 lg:px-14 pb-12 space-y-6">
                {extraBlocks.map((block) => (
                  <BlockRegistry key={block.id} block={block} />
                ))}
              </div>
            )}
          </SectionErrorBoundary>
        </section>
      );

    case "contact":
      return (
        <section id="contact" aria-labelledby="contact-heading" className="scroll-mt-28 sm:scroll-mt-32 lg:scroll-mt-36">
          <SectionErrorBoundary sectionName="Contact">
            <Contact />
            {extraBlocks.length > 0 && (
              <div className="mx-auto max-w-[1600px] px-4 sm:px-6 lg:px-14 pb-12 space-y-6">
                {extraBlocks.map((block) => (
                  <BlockRegistry key={block.id} block={block} />
                ))}
              </div>
            )}
          </SectionErrorBoundary>
        </section>
      );

    default:
      return <CustomSectionRenderer section={section} />;
  }
}
