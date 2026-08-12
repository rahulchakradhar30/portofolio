"use client";

import React, { useState } from "react";
import { resolveSkillIconUrl, fallbackSkillLogo } from "@/app/lib/skillLogoCatalog";

interface SkillIconProps {
  title: string;
  icon?: string;
  className?: string;
  imgClassName?: string;
}

export default function SkillIcon({ title, icon, className = "h-8 w-8", imgClassName = "h-full w-full object-contain" }: SkillIconProps) {
  // Resolve the URL once at render time — the useEffect that re-ran the same
  // computation immediately after mount was redundant and caused an extra render cycle.
  const [currentSrc, setCurrentSrc] = useState(() => resolveSkillIconUrl(icon, title));
  const [resolvedKey, setResolvedKey] = useState(() => `${icon ?? ""}::${title}`);

  // Only update when icon/title actually changes (after initial mount)
  const nextKey = `${icon ?? ""}::${title}`;
  if (nextKey !== resolvedKey) {
    setCurrentSrc(resolveSkillIconUrl(icon, title));
    setResolvedKey(nextKey);
  }

  const handleError = () => {
    setCurrentSrc(fallbackSkillLogo(title));
  };

  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
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
