"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Sparkles,
  BadgeCheck,
  Compass,
  Award,
  Terminal,
  Briefcase,
  Code,
  GraduationCap,
  Star,
  CheckCircle,
  ExternalLink,
  Mail,
  Layers,
  Globe,
  Cpu,
  ArrowRight,
  TrendingUp,
  FileText,
  Bookmark,
  Shield,
  Zap,
} from "lucide-react";
import type { HomepageBlock, BlockButton } from "@/app/lib/types";
import { useMotionPreferences } from "../MotionProvider";

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  sparkles: Sparkles,
  badgecheck: BadgeCheck,
  compass: Compass,
  award: Award,
  terminal: Terminal,
  briefcase: Briefcase,
  code: Code,
  graduationcap: GraduationCap,
  star: Star,
  checkcircle: CheckCircle,
  externallink: ExternalLink,
  mail: Mail,
  layers: Layers,
  globe: Globe,
  cpu: Cpu,
  arrowright: ArrowRight,
  trendingup: TrendingUp,
  filetext: FileText,
  bookmark: Bookmark,
  shield: Shield,
  zap: Zap,
};

export function getLucideIcon(iconName?: string): React.ComponentType<{ className?: string }> {
  if (!iconName) return Sparkles;
  const key = iconName.toLowerCase().replace(/[-_]/g, "");
  return ICON_MAP[key] || Sparkles;
}

export function renderButton(btn: BlockButton, reducedMotion: boolean) {
  if (btn.visible === false) return null;
  const Icon = btn.icon ? getLucideIcon(btn.icon) : null;

  let btnClass = "paper-button text-sm px-6 py-2.5 inline-flex items-center gap-2 font-bold transition-all duration-300";
  if (btn.stylePreset === "primary") {
    btnClass =
      "inline-flex items-center gap-2 rounded-xl border-2 border-[var(--foreground)] bg-[var(--accent)] px-6 py-2.5 text-sm font-bold text-white shadow-[4px_4px_0_0_rgba(42,36,31,0.9)] transition-all duration-300 hover:bg-[var(--accent-strong)] hover:shadow-[6px_6px_0_0_rgba(42,36,31,1)]";
  } else if (btn.stylePreset === "secondary") {
    btnClass =
      "inline-flex items-center gap-2 rounded-xl border-2 border-[var(--foreground)] bg-[var(--surface-strong)] px-6 py-2.5 text-sm font-bold text-[var(--foreground)] shadow-[4px_4px_0_0_rgba(42,36,31,0.9)] transition-all duration-300 hover:bg-[var(--surface-soft)]";
  } else if (btn.stylePreset === "outline") {
    btnClass = "paper-button text-sm px-6 py-2.5 inline-flex items-center gap-2 font-bold";
  } else if (btn.stylePreset === "ghost") {
    btnClass =
      "inline-flex items-center gap-2 px-4 py-2 text-sm font-bold text-[var(--foreground)] hover:text-[var(--accent)] transition-colors";
  } else if (btn.stylePreset === "accent") {
    btnClass =
      "inline-flex items-center gap-2 rounded-xl border-2 border-[var(--foreground)] bg-[var(--accent)] px-6 py-2.5 text-sm font-bold text-white shadow-[4px_4px_0_0_rgba(42,36,31,0.9)] transition-all duration-300 hover:scale-[1.02]";
  } else if (btn.stylePreset === "proof") {
    btnClass =
      "group relative inline-flex items-center gap-2 rounded-full border-2 border-[var(--foreground)] bg-[var(--surface-strong)] px-6 py-2.5 text-sm font-extrabold text-[var(--foreground)] shadow-[4px_4px_0_0_rgba(42,36,31,0.9)] transition-all duration-300 hover:bg-[var(--foreground)] hover:text-[var(--surface)]";
  }

  const isExternal = btn.destinationType === "url" || btn.destinationType === "email";

  const content = (
    <>
      {Icon && <Icon className="h-4 w-4 flex-shrink-0" />}
      <span>{btn.text}</span>
      {btn.destinationType === "url" && <ExternalLink className="h-3.5 w-3.5 opacity-70 ml-1" />}
    </>
  );

  return (
    <motion.div
      key={btn.id}
      whileHover={reducedMotion ? undefined : { y: -2 }}
      whileTap={reducedMotion ? undefined : { scale: 0.98 }}
    >
      {isExternal ? (
        <a href={btn.destination} target={btn.destinationType === "url" ? "_blank" : undefined} rel="noopener noreferrer" className={btnClass}>
          {content}
        </a>
      ) : (
        <Link href={btn.destination} className={btnClass}>
          {content}
        </Link>
      )}
    </motion.div>
  );
}

export default function BlockRegistry({ block }: { block: HomepageBlock }) {
  const { reducedMotion } = useMotionPreferences();

  if (block.visible === false) return null;

  const content = block.content || {};
  const style = block.style || {};

  const alignClass =
    style.align === "center"
      ? "text-center mx-auto"
      : style.align === "right"
      ? "text-right ml-auto"
      : "text-left";

  const spacingClass =
    style.spacing === "compact"
      ? "my-3"
      : style.spacing === "spacious"
      ? "my-10"
      : "my-6";

  const animationVariant =
    reducedMotion || style.animationPreset === "fade"
      ? { initial: { opacity: 0 }, animate: { opacity: 1 }, transition: { duration: 0.5 } }
      : style.animationPreset === "slide"
      ? { initial: { opacity: 0, y: 30 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.6 } }
      : style.animationPreset === "scale"
      ? { initial: { opacity: 0, scale: 0.95 }, animate: { opacity: 1, scale: 1 }, transition: { duration: 0.5 } }
      : { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.5 } };

  switch (block.type) {
    case "heading": {
      const Tag = content.headingLevel || "h3";
      const sizeClass =
        Tag === "h2"
          ? "text-3xl sm:text-4xl md:text-5xl font-black tracking-tight"
          : Tag === "h4"
          ? "text-xl sm:text-2xl font-extrabold tracking-tight"
          : "text-2xl sm:text-3xl font-extrabold tracking-tight";

      return (
        <motion.div {...animationVariant} className={`${spacingClass} ${alignClass}`}>
          <Tag
            className={`${sizeClass} text-[var(--foreground)] ${content.bold ? "font-black" : ""} ${
              content.italic ? "italic" : ""
            } ${content.underline ? "underline underline-offset-4" : ""}`}
            style={{ color: content.color || undefined }}
          >
            {content.headingText || content.text}
          </Tag>
        </motion.div>
      );
    }

    case "paragraph":
    case "rich_text": {
      return (
        <motion.div {...animationVariant} className={`${spacingClass} ${alignClass} max-w-4xl`}>
          <p
            className={`text-base sm:text-lg md:text-xl leading-relaxed text-[var(--foreground)]/85 ${
              content.bold ? "font-bold" : ""
            } ${content.italic ? "italic" : ""} ${content.underline ? "underline underline-offset-4" : ""}`}
            style={{ color: content.color || undefined }}
          >
            {content.paragraphText || content.text}
          </p>
        </motion.div>
      );
    }

    case "button":
    case "button_group": {
      const buttons = content.buttons && content.buttons.length > 0 ? content.buttons : [];

      return (
        <motion.div {...animationVariant} className={`${spacingClass} flex flex-wrap gap-4 items-center ${
          style.align === "center" ? "justify-center" : style.align === "right" ? "justify-end" : "justify-start"
        }`}>
          {buttons.map((btn) => renderButton(btn, reducedMotion))}
        </motion.div>
      );
    }

    case "highlight_box": {
      const HighlightIcon = getLucideIcon(content.highlightIcon);

      return (
        <motion.div {...animationVariant} className={`${spacingClass} max-w-4xl ${alignClass}`}>
          <div className="relative rounded-2xl border-2 border-[var(--foreground)] bg-[var(--surface-strong)] p-6 sm:p-8 shadow-[6px_6px_0_0_rgba(42,36,31,0.9)]">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl border-2 border-[var(--foreground)] bg-[var(--accent)] text-white shadow-[3px_3px_0_0_rgba(42,36,31,0.9)]">
                {React.createElement(HighlightIcon, { className: "h-6 w-6" })}
              </div>
              <div>
                {content.highlightTitle && (
                  <h4 className="text-xl font-extrabold text-[var(--foreground)] tracking-tight mb-2">
                    {content.highlightTitle}
                  </h4>
                )}
                <p className="text-base sm:text-lg leading-relaxed text-[var(--foreground)]/90 font-medium">
                  {content.highlightText || content.text}
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      );
    }

    case "stat_box":
    case "metric_grid": {
      const cards = content.cards && content.cards.length > 0 ? content.cards : [];
      const singleStatValue = content.statValue;
      const singleStatLabel = content.statLabel;

      if (cards.length === 0 && (singleStatValue || singleStatLabel)) {
        return (
          <motion.div {...animationVariant} className={`${spacingClass} ${alignClass} inline-block`}>
            <div className="rounded-2xl border-2 border-[var(--foreground)] bg-[var(--surface)] p-6 text-center shadow-[4px_4px_0_0_rgba(42,36,31,0.9)]">
              <div className="text-4xl sm:text-5xl font-black text-[var(--accent)]">{singleStatValue}</div>
              <div className="mt-2 text-sm font-extrabold uppercase tracking-widest text-[var(--foreground)]/80">
                {singleStatLabel}
              </div>
              {content.statSubtext && (
                <div className="mt-1 text-xs text-[var(--foreground)]/60 font-medium">{content.statSubtext}</div>
              )}
            </div>
          </motion.div>
        );
      }

      const desktopCols = style.columnsDesktop === 4 ? "lg:grid-cols-4" : style.columnsDesktop === 2 ? "sm:grid-cols-2" : "sm:grid-cols-2 lg:grid-cols-3";

      return (
        <motion.div {...animationVariant} className={`${spacingClass} grid grid-cols-1 ${desktopCols} gap-4 sm:gap-6`}>
          {cards.map((c) => {
            if (c.visible === false) return null;
            const CardIcon = c.icon ? getLucideIcon(c.icon) : null;
            return (
              <div key={c.id} className="paper-card p-6 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    {CardIcon ? (
                      <div className="p-2.5 rounded-xl border-2 border-[var(--foreground)] bg-[var(--surface-soft)] text-[var(--foreground)]">
                        <CardIcon className="h-5 w-5" />
                      </div>
                    ) : null}
                    {c.badge && (
                      <span className="paper-chip text-xs tracking-wider uppercase font-bold">{c.badge}</span>
                    )}
                  </div>
                  {c.statValue && (
                    <div className="text-3xl sm:text-4xl font-black text-[var(--accent)]">{c.statValue}</div>
                  )}
                  <h4 className="text-lg font-bold text-[var(--foreground)] mt-2">{c.title}</h4>
                  {c.description && (
                    <p className="text-sm text-[var(--foreground)]/70 mt-1 leading-relaxed">{c.description}</p>
                  )}
                </div>
                {c.button && <div className="mt-4">{renderButton(c.button, reducedMotion)}</div>}
              </div>
            );
          })}
        </motion.div>
      );
    }

    case "card":
    case "card_grid": {
      const cards = content.cards && content.cards.length > 0 ? content.cards : [];
      const desktopCols =
        style.columnsDesktop === 4
          ? "lg:grid-cols-4"
          : style.columnsDesktop === 2
          ? "sm:grid-cols-2"
          : style.columnsDesktop === 1
          ? "grid-cols-1"
          : "sm:grid-cols-2 lg:grid-cols-3";

      return (
        <motion.div {...animationVariant} className={`${spacingClass} grid grid-cols-1 ${desktopCols} gap-6`}>
          {cards.map((c) => {
            if (c.visible === false) return null;
            const CardIcon = c.icon ? getLucideIcon(c.icon) : null;
            return (
              <div key={c.id} className="paper-card p-6 sm:p-8 flex flex-col justify-between space-y-4">
                <div>
                  {c.image && (
                    <div className="relative mb-4 h-48 w-full overflow-hidden rounded-xl border-2 border-[var(--foreground)] bg-[var(--surface-soft)]">
                      <Image src={c.image} alt={c.title} fill className="object-cover" />
                    </div>
                  )}
                  <div className="flex items-center justify-between gap-2">
                    {CardIcon && (
                      <div className="p-2 rounded-xl border-2 border-[var(--foreground)] bg-[var(--surface-soft)]">
                        <CardIcon className="h-5 w-5 text-[var(--accent)]" />
                      </div>
                    )}
                    {c.badge && (
                      <span className="paper-chip text-xs tracking-wider uppercase font-bold">{c.badge}</span>
                    )}
                  </div>
                  <h4 className="text-xl font-black text-[var(--foreground)] tracking-tight mt-2">{c.title}</h4>
                  {c.subtitle && <p className="text-xs font-bold uppercase tracking-wider text-[var(--accent)] mt-1">{c.subtitle}</p>}
                  {c.description && (
                    <p className="text-sm text-[var(--foreground)]/80 mt-3 leading-relaxed">{c.description}</p>
                  )}
                  {c.tags && c.tags.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-1.5">
                      {c.tags.map((t, idx) => (
                        <span key={idx} className="rounded-md border border-[var(--foreground)]/30 bg-[var(--surface-soft)] px-2 py-0.5 text-xs font-semibold text-[var(--foreground)]/80">
                          {t}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                {c.button && <div className="pt-2">{renderButton(c.button, reducedMotion)}</div>}
              </div>
            );
          })}
        </motion.div>
      );
    }

    case "timeline_group": {
      const items = content.timelineItems && content.timelineItems.length > 0 ? content.timelineItems : [];

      return (
        <motion.div {...animationVariant} className={`${spacingClass} relative space-y-8 pl-4 sm:pl-8 border-l-2 border-[var(--foreground)]`}>
          {items.map((item, idx) => {
            if (item.visible === false) return null;

            return (
              <div key={item.id} className="relative group">
                {/* Timeline Connecting Indicator */}
                <div className={`absolute -left-[25px] sm:-left-[41px] top-1.5 flex h-8 w-8 items-center justify-center rounded-full border-2 border-[var(--foreground)] ${
                  item.isCurrent ? "bg-[var(--accent)] text-white" : "bg-[var(--surface)] text-[var(--foreground)]"
                } shadow-[2px_2px_0_0_rgba(42,36,31,0.9)]`}>
                  <span className="text-xs font-black">{item.stageNumber || idx + 1}</span>
                </div>

                <div className="paper-card p-6 sm:p-8">
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                    <span className="paper-chip text-xs tracking-wider uppercase font-bold">{item.label || item.period}</span>
                    {item.percentageOrStat && (
                      <span className="rounded-xl border-2 border-[var(--foreground)] bg-[var(--surface-strong)] px-3 py-1 text-xs font-black text-[var(--accent)] shadow-[2px_2px_0_0_rgba(42,36,31,0.8)]">
                        {item.statLabel ? `${item.statLabel}: ` : ""}{item.percentageOrStat}
                      </span>
                    )}
                  </div>
                  <h4 className="text-xl sm:text-2xl font-black text-[var(--foreground)]">{item.stageTitle}</h4>
                  {item.institution && (
                    <p className="text-sm font-bold text-[var(--accent)] mt-1">{item.institution}</p>
                  )}
                  <p className="text-sm sm:text-base text-[var(--foreground)]/80 mt-3 leading-relaxed">{item.description}</p>
                  {item.tags && item.tags.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-2">
                      {item.tags.map((t, tIdx) => (
                        <span key={tIdx} className="rounded-lg border border-[var(--foreground)]/30 bg-[var(--surface-soft)] px-2.5 py-1 text-xs font-bold text-[var(--foreground)]/80">
                          {t}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </motion.div>
      );
    }

    case "tag_group": {
      const tags = content.tags && content.tags.length > 0 ? content.tags : [];
      return (
        <motion.div {...animationVariant} className={`${spacingClass} flex flex-wrap gap-2 ${
          style.align === "center" ? "justify-center" : style.align === "right" ? "justify-end" : "justify-start"
        }`}>
          {tags.map((t, idx) => (
            <span key={idx} className="paper-chip text-xs sm:text-sm font-bold tracking-tight">
              {t}
            </span>
          ))}
        </motion.div>
      );
    }

    case "image": {
      if (!content.imageUrl) return null;
      return (
        <motion.div {...animationVariant} className={`${spacingClass} ${alignClass} max-w-4xl`}>
          <div className="relative rounded-2xl border-2 border-[var(--foreground)] bg-[var(--surface-soft)] overflow-hidden shadow-[6px_6px_0_0_rgba(42,36,31,0.9)]">
            <Image
              src={content.imageUrl}
              alt={content.imageAlt || "Section Image"}
              width={1200}
              height={675}
              className="w-full h-auto object-cover"
            />
          </div>
          {content.caption && (
            <p className="mt-2 text-xs sm:text-sm text-center text-[var(--foreground)]/70 font-medium italic">
              {content.caption}
            </p>
          )}
        </motion.div>
      );
    }

    case "divider": {
      return (
        <div className="my-10 max-w-4xl mx-auto flex items-center justify-center">
          <div className="h-0.5 w-full bg-[var(--foreground)]/20 rounded-full editorial-border" />
        </div>
      );
    }

    default:
      return null;
  }
}
