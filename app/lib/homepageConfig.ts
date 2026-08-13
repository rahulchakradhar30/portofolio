import type {
  HomepageConfig,
  HomepageSectionConfig,
  HomepageBlock,
  NavigationItemConfig,
  BuiltInSectionId,
  ButtonDestinationType,
  BlockButton,
  BlockCard,
  BlockTimelineItem,
} from "./types";

export const BUILT_IN_SECTIONS: {
  id: BuiltInSectionId;
  internalName: string;
  defaultTitle: string;
  defaultNavLabel: string;
}[] = [
  { id: "hero", internalName: "Hero Section", defaultTitle: "Hero", defaultNavLabel: "Home" },
  { id: "about", internalName: "About Section", defaultTitle: "About Me", defaultNavLabel: "About" },
  { id: "roadmap", internalName: "Academic Track", defaultTitle: "Academic Track", defaultNavLabel: "Academic Track" },
  { id: "radar", internalName: "Work Map", defaultTitle: "Interactive Work Map", defaultNavLabel: "Work Map" },
  { id: "skills", internalName: "Skills Grid", defaultTitle: "Skills", defaultNavLabel: "Skills" },
  { id: "projects", internalName: "Projects Showcase", defaultTitle: "Projects", defaultNavLabel: "Projects" },
  { id: "certifications", internalName: "Certifications", defaultTitle: "Certifications", defaultNavLabel: "Certifications" },
  { id: "contact", internalName: "Contact Section", defaultTitle: "Get in Touch", defaultNavLabel: "Contact" },
];

export function sanitizeDestinationUrl(rawUrl: string, type: ButtonDestinationType): string {
  if (!rawUrl) return "#";
  const trimmed = rawUrl.trim();

  // Reject unsafe schemes
  if (/^javascript:/i.test(trimmed) || /^data:/i.test(trimmed) || /^vbscript:/i.test(trimmed)) {
    return "#invalid-url";
  }

  if (type === "email") {
    return trimmed.startsWith("mailto:") ? trimmed : `mailto:${trimmed}`;
  }

  if (type === "hash") {
    return trimmed.startsWith("#") ? trimmed : `#${trimmed}`;
  }

  if (type === "route") {
    return trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
  }

  if (type === "url") {
    if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
      return trimmed;
    }
    if (trimmed.startsWith("/")) return trimmed;
    return `https://${trimmed}`;
  }

  return trimmed;
}

export function getDefaultHomepageConfig(): HomepageConfig {
  const sections: HomepageSectionConfig[] = BUILT_IN_SECTIONS.map((sec, index) => ({
    id: sec.id,
    type: sec.id,
    internalName: sec.internalName,
    publicDisplayTitle: sec.defaultTitle,
    visible: true,
    order: index + 1,
    navLabel: sec.defaultNavLabel,
    visibleInNav: true,
    isBuiltIn: true,
    layoutPreset: "paper",
    animationPreset: "fade",
    bgTreatment: "default",
    blocks: [],
  }));

  const navItems: NavigationItemConfig[] = BUILT_IN_SECTIONS.map((sec, index) => ({
    sectionId: sec.id,
    visibleInNav: true,
    navLabel: sec.defaultNavLabel,
    order: index + 1,
  }));

  return {
    version: 1,
    sections,
    navItems,
    updatedAt: new Date().toISOString(),
  };
}

export function normalizeHomepageConfig(input?: unknown): HomepageConfig {
  const defaultConf = getDefaultHomepageConfig();

  if (!input || typeof input !== "object") {
    return defaultConf;
  }

  const rawConfig = input as Partial<HomepageConfig>;

  // Process sections
  let sections: HomepageSectionConfig[] = [];
  if (Array.isArray(rawConfig.sections) && rawConfig.sections.length > 0) {
    sections = rawConfig.sections
      .filter((sec): sec is HomepageSectionConfig => Boolean(sec && typeof sec === "object" && sec.id))
      .map((sec, idx) => {
        const isBuiltIn = BUILT_IN_SECTIONS.some((b) => b.id === sec.id);

        const blocks: HomepageBlock[] = Array.isArray(sec.blocks)
          ? sec.blocks
              .filter((blk): blk is HomepageBlock => Boolean(blk && typeof blk === "object" && blk.id && blk.type))
              .map((blk, bIdx) => ({
                id: blk.id || `block-${bIdx}`,
                type: blk.type,
                visible: blk.visible !== false,
                order: Number(blk.order) || bIdx + 1,
                content: {
                  text: blk.content?.text || "",
                  headingText: blk.content?.headingText || "",
                  headingLevel: blk.content?.headingLevel || "h3",
                  paragraphText: blk.content?.paragraphText || "",
                  align: blk.content?.align || "left",
                  bold: Boolean(blk.content?.bold),
                  italic: Boolean(blk.content?.italic),
                  underline: Boolean(blk.content?.underline),
                  color: blk.content?.color || "",
                  highlightTitle: blk.content?.highlightTitle || "",
                  highlightText: blk.content?.highlightText || "",
                  highlightIcon: blk.content?.highlightIcon || "",
                  statValue: blk.content?.statValue || "",
                  statLabel: blk.content?.statLabel || "",
                  statSubtext: blk.content?.statSubtext || "",
                  imageUrl: blk.content?.imageUrl || "",
                  imageAlt: blk.content?.imageAlt || "",
                  caption: blk.content?.caption || "",
                  tags: Array.isArray(blk.content?.tags) ? blk.content!.tags.filter(Boolean) : [],
                  buttons: Array.isArray(blk.content?.buttons)
                    ? blk.content!.buttons.map((btn, btnIdx) => ({
                        id: btn.id || `btn-${btnIdx}`,
                        text: btn.text || "Button",
                        destinationType: btn.destinationType || "hash",
                        destination: sanitizeDestinationUrl(btn.destination || "#", btn.destinationType || "hash"),
                        stylePreset: btn.stylePreset || "primary",
                        icon: btn.icon || "",
                        visible: btn.visible !== false,
                        order: Number(btn.order) || btnIdx + 1,
                      }))
                    : [],
                  cards: Array.isArray(blk.content?.cards)
                    ? blk.content!.cards.map((crd, crdIdx) => ({
                        id: crd.id || `card-${crdIdx}`,
                        title: crd.title || "Card",
                        subtitle: crd.subtitle || "",
                        description: crd.description || "",
                        image: crd.image || "",
                        icon: crd.icon || "",
                        badge: crd.badge || "",
                        tags: Array.isArray(crd.tags) ? crd.tags.filter(Boolean) : [],
                        statValue: crd.statValue || "",
                        statLabel: crd.statLabel || "",
                        visible: crd.visible !== false,
                        order: Number(crd.order) || crdIdx + 1,
                        button: crd.button
                          ? {
                              id: crd.button.id || `card-btn-${crdIdx}`,
                              text: crd.button.text || "Learn More",
                              destinationType: crd.button.destinationType || "hash",
                              destination: sanitizeDestinationUrl(
                                crd.button.destination || "#",
                                crd.button.destinationType || "hash"
                              ),
                              stylePreset: crd.button.stylePreset || "outline",
                              icon: crd.button.icon || "",
                              visible: crd.button.visible !== false,
                              order: 1,
                            }
                          : undefined,
                      }))
                    : [],
                  timelineItems: Array.isArray(blk.content?.timelineItems)
                    ? blk.content!.timelineItems.map((tItem, tIdx) => ({
                        id: tItem.id || `timeline-${tIdx}`,
                        stageNumber: tItem.stageNumber || `0${tIdx + 1}`,
                        stageTitle: tItem.stageTitle || "Stage Title",
                        label: tItem.label || "",
                        institution: tItem.institution || "",
                        period: tItem.period || "",
                        description: tItem.description || "",
                        percentageOrStat: tItem.percentageOrStat || "",
                        statLabel: tItem.statLabel || "",
                        tags: Array.isArray(tItem.tags) ? tItem.tags.filter(Boolean) : [],
                        isCurrent: Boolean(tItem.isCurrent),
                        visible: tItem.visible !== false,
                        order: Number(tItem.order) || tIdx + 1,
                      }))
                    : [],
                },
                style: {
                  spacing: blk.style?.spacing || "normal",
                  width: blk.style?.width || "standard",
                  align: blk.style?.align || "left",
                  columnsDesktop: blk.style?.columnsDesktop || 3,
                  columnsTablet: blk.style?.columnsTablet || 2,
                  columnsMobile: blk.style?.columnsMobile || 1,
                  variant: blk.style?.variant || "paper",
                  animationPreset: blk.style?.animationPreset || "fade",
                },
              }))
              .sort((a, b) => a.order - b.order)
          : [];

        return {
          id: sec.id,
          type: (isBuiltIn ? sec.id : "custom") as HomepageSectionConfig["type"],
          internalName: sec.internalName || sec.publicDisplayTitle || "Section",
          publicDisplayTitle: sec.publicDisplayTitle || "Section",
          visible: sec.visible !== false,
          order: Number(sec.order) || idx + 1,
          navLabel: sec.navLabel || sec.publicDisplayTitle || sec.id,
          visibleInNav: sec.visibleInNav !== false,
          isBuiltIn,
          layoutPreset: sec.layoutPreset || "paper",
          animationPreset: sec.animationPreset || "fade",
          bgTreatment: sec.bgTreatment || "default",
          blocks,
        };
      })
      .sort((a, b) => a.order - b.order);
  } else {
    sections = defaultConf.sections;
  }

  // Ensure all built-in sections exist even if absent in user array
  BUILT_IN_SECTIONS.forEach((bSec) => {
    const exists = sections.some((s) => s.id === bSec.id);
    if (!exists) {
      sections.push({
        id: bSec.id,
        type: bSec.id,
        internalName: bSec.internalName,
        publicDisplayTitle: bSec.defaultTitle,
        visible: true,
        order: sections.length + 1,
        navLabel: bSec.defaultNavLabel,
        visibleInNav: true,
        isBuiltIn: true,
        layoutPreset: "paper",
        animationPreset: "fade",
        bgTreatment: "default",
        blocks: [],
      });
    }
  });

  // Re-sort
  sections.sort((a, b) => a.order - b.order);

  // Process Navigation items
  let navItems: NavigationItemConfig[] = [];
  if (Array.isArray(rawConfig.navItems) && rawConfig.navItems.length > 0) {
    navItems = rawConfig.navItems
      .filter((item): item is NavigationItemConfig => Boolean(item && typeof item === "object" && item.sectionId))
      .map((item, idx) => ({
        sectionId: item.sectionId,
        visibleInNav: item.visibleInNav !== false,
        navLabel: item.navLabel || item.sectionId,
        order: Number(item.order) || idx + 1,
        isCta: Boolean(item.isCta),
      }))
      .sort((a, b) => a.order - b.order);
  } else {
    navItems = sections
      .filter((s) => s.visible !== false && s.visibleInNav !== false)
      .map((s, idx) => ({
        sectionId: s.id,
        visibleInNav: true,
        navLabel: s.navLabel || s.publicDisplayTitle,
        order: idx + 1,
      }));
  }

  return {
    version: rawConfig.version || 1,
    sections,
    navItems,
    updatedAt: rawConfig.updatedAt || new Date().toISOString(),
  };
}
