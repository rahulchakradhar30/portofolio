"use client";

import React from "react";
import { usePortfolioContent } from "./PortfolioContentProvider";
import { normalizeGlassConfig } from "@/app/lib/glassResolver";

interface GlassSurfaceProps extends React.HTMLAttributes<HTMLDivElement> {
  sectionId?: string;
  componentId?: string;
  forceGlass?: boolean;
  children?: React.ReactNode;
}

export function isGlassEnabledForComponent(
  glassConfigInput: unknown,
  sectionId?: string,
  componentId?: string
): boolean {
  const norm = normalizeGlassConfig(glassConfigInput as Parameters<typeof normalizeGlassConfig>[0]);
  if (!norm.enabled) return false;

  // Check component-level override first
  if (componentId && norm.components?.[componentId]?.enabled !== undefined) {
    return Boolean(norm.components[componentId].enabled);
  }

  // Check section-level override
  if (sectionId && norm.sections?.[sectionId]?.enabled !== undefined) {
    return Boolean(norm.sections[sectionId].enabled);
  }

  return norm.enabled;
}

export function useGlassSurface(sectionId?: string, componentId?: string): { isGlassActive: boolean } {
  const { content } = usePortfolioContent();
  const isGlassActive = isGlassEnabledForComponent(content?.glassConfig, sectionId, componentId);
  return { isGlassActive };
}

export default function GlassSurface({
  sectionId,
  componentId,
  forceGlass,
  className = "",
  children,
  ...props
}: GlassSurfaceProps) {
  const { content } = usePortfolioContent();
  const isEnabled = forceGlass || isGlassEnabledForComponent(content?.glassConfig, sectionId, componentId);

  return (
    <div
      data-glass-surface={isEnabled ? "true" : "false"}
      className={`${isEnabled ? "glass-surface" : ""} ${className}`.trim()}
      {...props}
    >
      {children}
    </div>
  );
}
