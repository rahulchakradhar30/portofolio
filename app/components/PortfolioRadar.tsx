"use client";

import { useEffect, useMemo, useRef, useState, type MouseEvent } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowUpRight, Layers3, Sparkles, Star } from "lucide-react";
import type { Certification, Project, RadarConfig, RadarKind, Skill } from "@/app/lib/types";
import { prioritizeFeatured } from "@/app/lib/contentOrdering";
import { resolveSkillIconUrl } from "@/app/lib/skillLogoCatalog";
import ExpandableSection from "./ExpandableSection";
import { useMotionPreferences } from "./MotionProvider";
import { getSiteCopy } from "@/app/lib/siteCopy";
import { usePortfolioContent } from "./PortfolioContentProvider";
import { useIsMobile } from "./useViewport";

type RadarNode = {
  id: string;
  title: string;
  subtitle: string;
  href: string;
  accent: string;
  kind: "skill" | "project" | "certification";
  iconUrl?: string;
};

const ACCENTS = ["#22d3ee", "#6366f1", "#38bdf8", "#818cf8", "#67e8f9", "#a5b4fc"];

const DEFAULT_RADAR_CONFIG: RadarConfig = {
  enabledKinds: ["skill", "project", "certification"],
  skillIds: [],
  projectIds: [],
  certificationIds: [],
  maxSkills: 5,
  maxProjects: 3,
  maxCertifications: 3,
};

function normalizeRadarConfig(input?: Partial<RadarConfig> | null): RadarConfig {
  const enabledKinds =
    Array.isArray(input?.enabledKinds) && input.enabledKinds.length > 0
      ? input.enabledKinds.filter(
          (kind): kind is RadarKind => kind === "skill" || kind === "project" || kind === "certification"
        )
      : DEFAULT_RADAR_CONFIG.enabledKinds;

  return {
    enabledKinds,
    skillIds: Array.isArray(input?.skillIds) ? input.skillIds.filter(Boolean) : [],
    projectIds: Array.isArray(input?.projectIds) ? input.projectIds.filter(Boolean) : [],
    certificationIds: Array.isArray(input?.certificationIds) ? input.certificationIds.filter(Boolean) : [],
    maxSkills: Math.min(12, Math.max(1, Number(input?.maxSkills) || DEFAULT_RADAR_CONFIG.maxSkills)),
    maxProjects: Math.min(12, Math.max(1, Number(input?.maxProjects) || DEFAULT_RADAR_CONFIG.maxProjects)),
    maxCertifications: Math.min(12, Math.max(1, Number(input?.maxCertifications) || DEFAULT_RADAR_CONFIG.maxCertifications)),
  };
}

function pickByIds<T extends { id: string }>(items: T[], ids: string[]) {
  if (!ids.length) return [] as T[];
  const map = new Map(items.map((item) => [item.id, item]));
  return ids.map((id) => map.get(id)).filter(Boolean) as T[];
}

export default function PortfolioRadar() {
  const { content } = usePortfolioContent();
  const { reducedMotion } = useMotionPreferences();
  const [skills, setSkills] = useState<Skill[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [certifications, setCertifications] = useState<Certification[]>([]);
  const [loading, setLoading] = useState(true);
  const [pointer, setPointer] = useState({ x: 0, y: 0, active: false });
  // Re-use the shared viewport hook instead of duplicating resize listener logic
  const isCompactViewport = useIsMobile(1024);

  const isVisible = content ? content.sectionVisibility?.radar !== false : true;
  const siteCopy = useMemo(() => getSiteCopy(content), [content]);
  const radarConfig = useMemo(() => normalizeRadarConfig(content?.radarConfig), [content]);

  useEffect(() => {
    const loadRadar = async () => {
      try {
        const [skillsRes, projectsRes, certificationsRes] = await Promise.all([
          fetch("/api/admin/skills"),
          fetch("/api/admin/projects"),
          fetch("/api/admin/certifications"),
        ]);

        const [skillsData, projectsData, certificationsData] = await Promise.all([
          skillsRes.json(),
          projectsRes.json(),
          certificationsRes.json(),
        ]);

        setSkills(Array.isArray(skillsData.skills) ? skillsData.skills : []);
        setProjects(Array.isArray(projectsData.projects) ? projectsData.projects : []);
        setCertifications(Array.isArray(certificationsData.certifications) ? certificationsData.certifications : []);
      } catch (error) {
        console.error("Error loading portfolio radar:", error);
      } finally {
        setLoading(false);
      }
    };

    loadRadar();
  }, []);

  const radarNodes = useMemo<RadarNode[]>(() => {
    const skillsSource = radarConfig.skillIds.length ? pickByIds(skills, radarConfig.skillIds) : prioritizeFeatured(skills);
    const projectsSource = radarConfig.projectIds.length ? pickByIds(projects, radarConfig.projectIds) : prioritizeFeatured(projects);
    const certificationsSource = radarConfig.certificationIds.length
      ? pickByIds(certifications, radarConfig.certificationIds)
      : prioritizeFeatured(certifications);

    const selectedSkills = radarConfig.enabledKinds.includes("skill") ? skillsSource.slice(0, radarConfig.maxSkills) : [];
    const selectedProjects = radarConfig.enabledKinds.includes("project") ? projectsSource.slice(0, radarConfig.maxProjects) : [];
    const selectedCerts = radarConfig.enabledKinds.includes("certification")
      ? certificationsSource.slice(0, radarConfig.maxCertifications)
      : [];

    return [
      ...selectedSkills.map((skill, index) => ({
        id: skill.id,
        title: skill.title,
        subtitle: `${skill.proficiency || 80}% focus`,
        href: "/skills",
        accent: ACCENTS[index % ACCENTS.length],
        kind: "skill" as const,
        iconUrl: resolveSkillIconUrl(skill.icon),
      })),
      ...selectedProjects.map((project, index) => ({
        id: project.id,
        title: project.title,
        subtitle: project.category || "Project",
        href: `/projects/${project.id}`,
        accent: ACCENTS[(index + 2) % ACCENTS.length],
        kind: "project" as const,
      })),
      ...selectedCerts.map((certification, index) => ({
        id: certification.id,
        title: certification.title,
        subtitle: certification.issuer,
        href: `/certifications/${certification.id}`,
        accent: ACCENTS[(index + 4) % ACCENTS.length],
        kind: "certification" as const,
      })),
    ];
  }, [certifications, projects, radarConfig, skills]);

  const stats = useMemo(() => {
    const skillCount = radarNodes.filter((node) => node.kind === "skill").length;
    const projectCount = radarNodes.filter((node) => node.kind === "project").length;
    const certificationCount = radarNodes.filter((node) => node.kind === "certification").length;

    return [
      { label: "Skills", value: skillCount },
      { label: "Projects", value: projectCount },
      { label: "Certifications", value: certificationCount },
      { label: "On Radar", value: radarNodes.length },
    ];
  }, [radarNodes]);

  const rafRef = useRef<number | null>(null);

  const onRadarMove = (event: MouseEvent<HTMLDivElement>) => {
    if (reducedMotion) return;
    // Cache event data synchronously — event object is not safe to read async
    const rect = event.currentTarget.getBoundingClientRect();
    const clientX = event.clientX;
    const clientY = event.clientY;

    // Cancel any pending frame to avoid stale updates
    if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => {
      const x = ((clientX - rect.left) / rect.width) * 2 - 1;
      const y = ((clientY - rect.top) / rect.height) * 2 - 1;
      setPointer({ x, y, active: true });
      rafRef.current = null;
    });
  };

  const onRadarLeave = () => {
    if (reducedMotion) return;
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    setPointer({ x: 0, y: 0, active: false });
  };

  const orbitRadius = radarNodes.length > 8 ? 34 : 38;
  const tiltX = reducedMotion ? 0 : pointer.y * -5;
  const tiltY = reducedMotion ? 0 : pointer.x * 7;

  if (!loading && !isVisible) return null;

  return (
    <section className="relative overflow-hidden px-4 py-24 sm:px-6 lg:px-10">
      <div className="relative z-10 mx-auto max-w-[1600px]">
        <motion.div
          initial={reducedMotion ? false : { opacity: 0, y: 40 }}
          whileInView={reducedMotion ? undefined : { opacity: 1, y: 0 }}
          transition={reducedMotion ? undefined : { duration: 0.8 }}
          viewport={{ once: true, amount: 0.2 }}
          className="mb-10 text-center sm:mb-14"
        >
          <div className="paper-chip mx-auto inline-flex items-center gap-2 uppercase tracking-[0.24em]">
            <Sparkles className="h-4 w-4" />
            {siteCopy.radarBadge}
          </div>
          <h2 id="radar-heading" className="mt-5 text-4xl font-black tracking-tighter text-[var(--foreground)] sm:text-5xl md:text-6xl">
            {siteCopy.radarHeading}
          </h2>
          <p className="mx-auto mt-4 max-w-3xl text-sm font-medium leading-relaxed text-[var(--foreground)]/75 sm:text-base md:text-lg">
            {siteCopy.radarSubtitle}
          </p>
        </motion.div>

        <ExpandableSection collapsedMaxHeightPx={880}>
          <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
            <motion.div
              initial={reducedMotion ? false : { opacity: 0, x: -40 }}
              whileInView={reducedMotion ? undefined : { opacity: 1, x: 0 }}
              transition={reducedMotion ? undefined : { duration: 0.8 }}
              viewport={{ once: true, amount: 0.18 }}
              className="relative"
            >
              {isCompactViewport ? (
                <div className="paper-card p-4 shadow-none sm:p-5">
                  <div className="mb-4 flex items-center justify-between rounded-2xl border-2 border-[var(--foreground)]/10 bg-[var(--surface-soft)] p-4">
                    <div>
                      <div className="text-[11px] font-bold uppercase tracking-[0.28em] text-[var(--accent)]">Signal Core</div>
                      <div className="mt-1 text-2xl font-black tracking-tight text-[var(--foreground)]">
                        {stats.reduce((total, item) => total + item.value, 0)}
                      </div>
                      <div className="text-xs text-[var(--foreground)]/65">active portfolio signals</div>
                    </div>
                    <div className="h-10 w-10 rounded-full border-2 border-[var(--foreground)]/10 bg-[var(--surface)]" />
                  </div>

                  {!loading ? (
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      {radarNodes.map((node) => (
                        <Link
                          key={`${node.kind}-${node.id}`}
                          href={node.href}
                          className="paper-card flex items-center gap-3 px-3 py-3 shadow-none transition-transform duration-300 hover:-translate-y-1"
                        >
                          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl border-2 border-[var(--foreground)]/10 bg-[var(--surface-soft)]">
                            {node.iconUrl ? (
                              <div
                                role="img"
                                aria-label={node.title}
                                className="h-6 w-6 bg-contain bg-center bg-no-repeat"
                                style={{ backgroundImage: `url(${node.iconUrl})` }}
                              />
                            ) : (
                              <span className="text-sm font-black text-[var(--foreground)]">
                                {node.kind === "project" ? "P" : node.kind === "certification" ? "C" : "S"}
                              </span>
                            )}
                          </div>
                          <div className="min-w-0">
                            <div className="truncate text-sm font-bold text-[var(--foreground)]">{node.title}</div>
                            <div className="truncate text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--accent)]">
                              {node.subtitle}
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <div className="skeleton-shimmer h-52 rounded-2xl border-2 border-[var(--foreground)]/10" />
                  )}
                </div>
              ) : (
                <div className="relative mx-auto aspect-square max-w-[560px] [perspective:1400px]" onMouseMove={onRadarMove} onMouseLeave={onRadarLeave}>
                  <motion.div
                    className="paper-card relative h-full w-full p-4 shadow-none sm:p-6"
                    style={{ transformStyle: "preserve-3d" }}
                    animate={reducedMotion ? undefined : { rotateX: tiltX, rotateY: tiltY }}
                    transition={reducedMotion ? undefined : { duration: pointer.active ? 0.08 : 0.45, ease: pointer.active ? "linear" : "easeOut" }}
                  >
                    <div className="absolute inset-4 rounded-[1.75rem] border-2 border-[var(--foreground)]/10" />
                    <div className="absolute inset-[12%] rounded-full border border-[var(--foreground)]/10" />
                    <div className="absolute inset-[24%] rounded-full border border-[var(--accent)]/20" />
                    <div className="absolute inset-[7%] rounded-full border border-[var(--foreground)]/5" style={{ transform: "translateZ(18px)" }} />

                    <motion.div
                      animate={reducedMotion ? undefined : { rotate: 360 }}
                      transition={reducedMotion ? undefined : { duration: 28, ease: "linear", repeat: Infinity }}
                      className="absolute inset-0"
                    >
                      <div className="absolute left-1/2 top-[9%] h-[82%] w-[1px] bg-gradient-to-b from-transparent via-[var(--accent)]/30 to-transparent" />
                      <div className="absolute left-[9%] top-1/2 h-[1px] w-[82%] bg-gradient-to-r from-transparent via-[var(--accent)]/30 to-transparent" />
                      <div className="absolute left-1/2 top-1/2 h-[72%] w-[72%] -translate-x-1/2 -translate-y-1/2 rounded-full border border-[var(--foreground)]/5" />
                    </motion.div>

                    <div className="absolute left-1/2 top-1/2 flex h-[38%] w-[38%] -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 border-[var(--foreground)]/10 bg-[var(--surface)]/90 text-center shadow-[0_0_80px_rgba(122,95,71,0.08)]">
                      <div>
                        <div className="text-[11px] font-bold uppercase tracking-[0.28em] text-[var(--accent)]">Interactive Work Map</div>
                        <div className="mt-2 text-2xl font-black tracking-tight text-[var(--foreground)]">
                          {stats.reduce((total, item) => total + item.value, 0)}
                        </div>
                        <div className="mt-1 text-xs text-[var(--foreground)]/65">connected portfolio signals</div>
                      </div>
                    </div>

                    {!reducedMotion ? (
                      <motion.div
                        className="pointer-events-none absolute -inset-5 rounded-full"
                        animate={{
                          background: `radial-gradient(circle at ${50 + pointer.x * 20}% ${50 + pointer.y * 18}%, rgba(56,189,248,0.16), rgba(56,189,248,0) 58%)`,
                        }}
                        transition={{ duration: pointer.active ? 0.07 : 0.45 }}
                      />
                    ) : null}

                    {!loading &&
                      radarNodes.map((node, index) => {
                        const angle = (360 / Math.max(radarNodes.length, 1)) * index - 90;
                        const x = 50 + orbitRadius * Math.cos((angle * Math.PI) / 180);
                        const y = 50 + orbitRadius * Math.sin((angle * Math.PI) / 180);
                        const depth = node.kind === "project" ? 72 : node.kind === "certification" ? 62 : 82;

                        return (
                          <motion.a
                            key={`${node.kind}-${node.id}`}
                            href={node.href}
                            initial={reducedMotion ? false : { opacity: 0, scale: 0.8 }}
                            whileInView={reducedMotion ? undefined : { opacity: 1, scale: 1 }}
                            whileHover={reducedMotion ? undefined : { y: -6, scale: 1.05 }}
                            transition={reducedMotion ? undefined : { duration: 0.5, delay: index * 0.06 }}
                            viewport={{ once: true, amount: 0.2 }}
                            className="group absolute flex min-w-[120px] -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-2 rounded-2xl border-2 border-[var(--foreground)]/10 bg-[var(--surface)] px-2.5 py-3 text-center shadow-[4px_4px_0_0_rgba(47,36,27,0.08)] transition-transform hover:-translate-y-2 lg:min-w-[134px] xl:min-w-[150px]"
                            style={{ left: `${x}%`, top: `${y}%`, transform: `translate(-50%, -50%) translateZ(${depth}px)` }}
                          >
                            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border-2 border-[var(--foreground)]/10 bg-[var(--surface-soft)] shadow-[0_0_20px_rgba(122,95,71,0.08)]">
                              {node.iconUrl ? (
                                <div
                                  role="img"
                                  aria-label={node.title}
                                  className="h-7 w-7 bg-contain bg-center bg-no-repeat"
                                  style={{ backgroundImage: `url(${node.iconUrl})` }}
                                />
                              ) : (
                                <span className="text-lg font-black text-[var(--foreground)]">
                                  {node.kind === "project" ? "P" : node.kind === "certification" ? "C" : "S"}
                                </span>
                              )}
                            </div>
                            <div className="max-w-full">
                              <div className="truncate text-xs font-bold text-[var(--foreground)] sm:text-sm">{node.title}</div>
                              <div className="mt-0.5 truncate text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--accent)]">
                                {node.subtitle}
                              </div>
                            </div>
                          </motion.a>
                        );
                      })}

                    {loading ? (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="skeleton-shimmer h-52 w-52 rounded-full border-2 border-[var(--foreground)]/10" />
                      </div>
                    ) : null}
                  </motion.div>
                </div>
              )}
            </motion.div>

            <motion.div
              initial={reducedMotion ? false : { opacity: 0, x: 40 }}
              whileInView={reducedMotion ? undefined : { opacity: 1, x: 0 }}
              transition={reducedMotion ? undefined : { duration: 0.8 }}
              viewport={{ once: true, amount: 0.18 }}
              className="space-y-6"
            >
              <div className="paper-card p-6 shadow-none sm:p-8">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.24em] text-[var(--accent)]">
                  <Layers3 className="h-4 w-4" />
                  Live portfolio metrics
                </div>
                <div className="mt-6 grid grid-cols-2 gap-3 sm:gap-4">
                  {stats.map((stat) => (
                    <div key={stat.label} className="rounded-2xl border-2 border-[var(--foreground)]/10 bg-[var(--surface-soft)] p-4 shadow-[3px_3px_0_0_rgba(47,36,27,0.06)]">
                      <div className="text-[11px] font-bold uppercase tracking-[0.22em] text-[var(--accent)]">{stat.label}</div>
                      <div className="mt-2 text-3xl font-black tracking-tight text-[var(--foreground)]">{stat.value}</div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 rounded-2xl border-2 border-[var(--foreground)]/10 bg-[var(--surface)] p-4 shadow-[4px_4px_0_0_rgba(47,36,27,0.06)]">
                  <div className="flex items-center gap-2 text-sm font-semibold text-[var(--foreground)]">
                    <Star className="h-4 w-4 text-[var(--accent)]" />
                    {siteCopy.radarFeatureTitle}
                  </div>
                  <p className="mt-2 text-sm leading-relaxed text-[var(--foreground)]/70">
                    {siteCopy.radarFeatureCopy}
                  </p>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <Link href="#skills" className="paper-button px-4 py-4 text-sm font-semibold">
                  {siteCopy.radarExploreSkills} <ArrowUpRight className="ml-2 inline h-4 w-4" />
                </Link>
                <Link href="#projects" className="paper-button px-4 py-4 text-sm font-semibold">
                  {siteCopy.radarSeeProjects} <ArrowUpRight className="ml-2 inline h-4 w-4" />
                </Link>
                <Link href="#certifications" className="paper-button px-4 py-4 text-sm font-semibold">
                  {siteCopy.radarViewCredentials} <ArrowUpRight className="ml-2 inline h-4 w-4" />
                </Link>
              </div>

              <div className="paper-card p-5 text-sm leading-relaxed text-[var(--foreground)]/75 shadow-none sm:p-6">
                {siteCopy.radarCommandCopy}
              </div>
            </motion.div>
          </div>
        </ExpandableSection>
      </div>
    </section>
  );
}