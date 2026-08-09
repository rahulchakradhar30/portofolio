"use client";

import React, { useState, useEffect } from "react";
import { resolveSkillIconUrl, fallbackSkillLogo } from "@/app/lib/skillLogoCatalog";

interface SkillIconProps {
  title: string;
  icon?: string;
  className?: string;
  imgClassName?: string;
}

export default function SkillIcon({ title, icon, className = "h-8 w-8", imgClassName = "h-full w-full object-contain" }: SkillIconProps) {
  const resolvedUrl = resolveSkillIconUrl(icon, title);
  const [currentSrc, setCurrentSrc] = useState(resolvedUrl);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    const nextUrl = resolveSkillIconUrl(icon, title);
    setCurrentSrc(nextUrl);
    setHasError(false);
  }, [icon, title]);

  const handleError = () => {
    if (!hasError) {
      setHasError(true);
      setCurrentSrc(fallbackSkillLogo(title));
    }
  };

  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      <img
        src={currentSrc}
        alt={`${title} logo`}
        className={imgClassName}
        onError={handleError}
        loading="lazy"
      />
    </div>
  );
}
