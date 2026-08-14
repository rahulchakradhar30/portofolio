"use client";

import React from "react";
import type { HomepageSectionConfig } from "@/app/lib/types";
import SectionErrorBoundary from "../SectionErrorBoundary";
import HeroWall from "./HeroWall";
import AboutWall from "./AboutWall";
import StudyRoadmapWall from "./StudyRoadmapWall";
import SkillsWall from "./SkillsWall";
import ExperienceWall from "./ExperienceWall";
import ProjectsWall from "./ProjectsWall";
import CertificationsWall from "./CertificationsWall";
import PortfolioRadarWall from "./PortfolioRadarWall";
import ContactWall from "./ContactWall";
import ProofModeWall from "./ProofModeWall";
import CustomWall from "./CustomWall";

interface Theme2SectionAdapterProps {
  section: HomepageSectionConfig;
  isActive: boolean;
}

export default function Theme2SectionAdapter({
  section,
  isActive: _isActive,
}: Theme2SectionAdapterProps) {
  const sectionId = section.id.toLowerCase();
  const sectionType = (section.type || section.id).toLowerCase();

  const renderWallContent = () => {
    switch (sectionId) {
      case "hero":
      case "home":
        return <HeroWall />;

      case "about":
        return <AboutWall />;

      case "roadmap":
      case "academic":
      case "education":
        return <StudyRoadmapWall />;

      case "skills":
      case "skill":
        return <SkillsWall />;

      case "experience":
      case "career":
        return <ExperienceWall />;

      case "projects":
      case "project":
        return <ProjectsWall />;

      case "certifications":
      case "certification":
      case "credentials":
        return <CertificationsWall />;

      case "radar":
      case "portfolioradar":
        return <PortfolioRadarWall />;

      case "contact":
      case "hire":
        return <ContactWall />;

      case "proof":
      case "proofmode":
      case "proof-mode":
        return <ProofModeWall />;

      default:
        // Handle custom section types or custom section IDs
        if (sectionType === "hero") return <HeroWall />;
        if (sectionType === "about") return <AboutWall />;
        if (sectionType === "roadmap") return <StudyRoadmapWall />;
        if (sectionType === "skills") return <SkillsWall />;
        if (sectionType === "experience") return <ExperienceWall />;
        if (sectionType === "projects") return <ProjectsWall />;
        if (sectionType === "certifications") return <CertificationsWall />;
        if (sectionType === "radar") return <PortfolioRadarWall />;
        if (sectionType === "contact") return <ContactWall />;
        if (sectionType === "proof") return <ProofModeWall />;

        return <CustomWall section={section} />;
    }
  };

  return (
    <SectionErrorBoundary sectionName={`Theme2Wall-${section.id}`}>
      <div className="w-full h-full">
        {renderWallContent()}
      </div>
    </SectionErrorBoundary>
  );
}
