"use client";

import React from "react";
import type { TypographyStyle } from "@/app/lib/types";

interface FormattedTextProps {
  text: string;
  styleOverride?: TypographyStyle;
  className?: string;
  as?: React.ElementType;
}

export default function FormattedText({
  text,
  styleOverride,
  className = "",
  as: Component = "span",
}: FormattedTextProps) {
  if (!styleOverride || (!styleOverride.color && !styleOverride.bold && !styleOverride.italic && !styleOverride.underline)) {
    return <Component className={className}>{text}</Component>;
  }

  const inlineStyles: React.CSSProperties = {};
  if (styleOverride.color) {
    inlineStyles.color = styleOverride.color;
  }
  if (styleOverride.bold) {
    inlineStyles.fontWeight = "bold";
  }
  if (styleOverride.italic) {
    inlineStyles.fontStyle = "italic";
  }
  if (styleOverride.underline) {
    inlineStyles.textDecoration = "underline";
  }

  return (
    <Component className={className} style={inlineStyles}>
      {text}
    </Component>
  );
}
