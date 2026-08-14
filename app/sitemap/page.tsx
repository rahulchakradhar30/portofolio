import type { Metadata } from "next";
import Link from "next/link";
import serverFirebaseHelpers from "@/app/lib/firebaseServer";
import type { Project, Certification, ProofExperience } from "@/app/lib/types";
import { SITE_NAME, PRIMARY_NAME, SITE_URL } from "@/app/lib/seoSchemas";
import { BackButton } from "@/app/components/NavigationContext";
import { ArrowLeft, Compass, FolderGit2, Award, Sparkles, FileText, Mail, Home, User, GraduationCap, Cpu } from "lucide-react";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: `HTML Sitemap | ${SITE_NAME}`,
  description: `Complete user-facing sitemap and directory of public pages, projects, certifications, and technical proof of work for ${PRIMARY_NAME}.`,
  alternates: {
    canonical: `${SITE_URL}/sitemap`,
  },
};

export default async function SitemapPage() {
  let projects: Project[] = [];
  let certifications: Certification[] = [];
  let proofExperiences: ProofExperience[] = [];

  try {
    projects = (await serverFirebaseHelpers.getAllProjects()) as Project[];
    certifications = (await serverFirebaseHelpers.getAllCertifications()) as Certification[];
    proofExperiences = (await serverFirebaseHelpers.getAllProofExperiences()) as ProofExperience[];
  } catch (error) {
    console.error("Error loading sitemap data:", error);
  }

  const mainPages = [
    { name: "Home", href: "/", icon: Home, desc: "Main portfolio landing page, hero, and interactive overview." },
    { name: "About", href: "/#about", icon: User, desc: "Background, mindset, value proposition, and core philosophy." },
    { name: "Academic Track", href: "/#roadmap", icon: GraduationCap, desc: "Educational milestones and academic roadmap." },
    { name: "Work Map / Radar", href: "/#radar", icon: Cpu, desc: "Interactive capability radar connecting skills, projects, and credentials." },
    { name: "Skills", href: "/#skills", icon: Sparkles, desc: "Technical skill matrix, AI/ML capabilities, and framework proficiency." },
    { name: "Projects", href: "/projects", icon: FolderGit2, desc: "Full case studies and software projects archive." },
    { name: "Certifications", href: "/certifications", icon: Award, desc: "Verified credentials, licenses, and professional certificates." },
    { name: "Proof Mode", href: "/proof-mode", icon: Sparkles, desc: "Deep-dive technical proof of work and architecture analysis." },
    { name: "Hire Me", href: "/hire", icon: FileText, desc: "Direct hiring proposal form for founders, clients, and recruiters." },
    { name: "Contact", href: "/#contact", icon: Mail, desc: "Direct contact options, message form, and social links." },
  ];

  return (
    <main className="min-h-screen bg-[var(--background)] text-[var(--foreground)] pt-28 pb-20 px-4 sm:px-6 lg:px-10">
      <div className="max-w-[1400px] mx-auto">
        <div className="mb-8">
          <BackButton fallback="/" className="paper-button inline-flex items-center gap-2 px-4 py-2 text-xs font-bold uppercase tracking-wider mb-6">
            <ArrowLeft className="h-4 w-4" /> Back to Portfolio
          </BackButton>
          <div className="paper-chip inline-flex items-center gap-2 uppercase tracking-[0.2em] mb-3">
            <Compass className="h-3.5 w-3.5" />
            HTML Sitemap
          </div>
          <h1 className="text-4xl sm:text-5xl font-black tracking-tight">Website Directory & Sitemap</h1>
          <p className="mt-3 text-lg font-medium text-[var(--foreground)]/80 max-w-2xl">
            A comprehensive, accessible directory of all public pages, projects, credentials, and proof of work across this portfolio.
          </p>
        </div>

        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-3 mt-12">
          {/* Main Pages Section */}
          <section aria-labelledby="sitemap-main-heading" className="paper-card p-6 sm:p-8 space-y-4">
            <h2 id="sitemap-main-heading" className="text-2xl font-black tracking-tight text-[var(--accent)] flex items-center gap-2 border-b-2 border-[var(--foreground)]/10 pb-3">
              <Compass className="h-5 w-5" />
              Main Destinations
            </h2>
            <ul className="space-y-3">
              {mainPages.map((page) => {
                const Icon = page.icon;
                return (
                  <li key={page.href}>
                    <Link href={page.href} className="group block p-3 rounded-xl border border-[var(--foreground)]/10 bg-[var(--surface-soft)] hover:bg-[var(--surface-strong)] transition-all">
                      <div className="font-bold text-base flex items-center gap-2 text-[var(--foreground)] group-hover:text-[var(--accent)]">
                        <Icon className="h-4 w-4 shrink-0 text-[var(--accent)]" />
                        {page.name}
                      </div>
                      <p className="text-xs text-[var(--foreground)]/70 mt-1">{page.desc}</p>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </section>

          {/* Projects Section */}
          <section aria-labelledby="sitemap-projects-heading" className="paper-card p-6 sm:p-8 space-y-4">
            <h2 id="sitemap-projects-heading" className="text-2xl font-black tracking-tight text-[var(--accent)] flex items-center gap-2 border-b-2 border-[var(--foreground)]/10 pb-3">
              <FolderGit2 className="h-5 w-5" />
              Projects Archive ({projects.length})
            </h2>
            {projects.length > 0 ? (
              <ul className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
                {projects.map((project) => (
                  <li key={project.id}>
                    <Link href={`/projects/${project.id}`} className="group block p-3 rounded-xl border border-[var(--foreground)]/10 bg-[var(--surface-soft)] hover:bg-[var(--surface-strong)] transition-all">
                      <div className="font-bold text-sm text-[var(--foreground)] group-hover:text-[var(--accent)]">
                        {project.title}
                      </div>
                      {project.description && (
                        <p className="text-xs text-[var(--foreground)]/70 mt-1 line-clamp-2">{project.description}</p>
                      )}
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm font-medium text-[var(--foreground)]/60">No projects available.</p>
            )}
          </section>

          {/* Certifications & Proof Mode Section */}
          <section aria-labelledby="sitemap-proof-heading" className="paper-card p-6 sm:p-8 space-y-6 md:col-span-2 lg:col-span-1">
            <div>
              <h2 id="sitemap-proof-heading" className="text-2xl font-black tracking-tight text-[var(--accent)] flex items-center gap-2 border-b-2 border-[var(--foreground)]/10 pb-3 mb-4">
                <Sparkles className="h-5 w-5" />
                Proof Mode Studies ({proofExperiences.length})
              </h2>
              {proofExperiences.length > 0 ? (
                <ul className="space-y-3">
                  {proofExperiences.map((proof) => (
                    <li key={proof.id}>
                      <Link href={`/proof-mode/${proof.id}`} className="group block p-3 rounded-xl border border-[var(--foreground)]/10 bg-[var(--surface-soft)] hover:bg-[var(--surface-strong)] transition-all">
                        <div className="font-bold text-sm text-[var(--foreground)] group-hover:text-[var(--accent)]">
                          {proof.title}
                        </div>
                        <p className="text-xs text-[var(--accent)] font-bold uppercase tracking-wider mt-0.5">{proof.category}</p>
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm font-medium text-[var(--foreground)]/60">No proof entries found.</p>
              )}
            </div>

            <div>
              <h2 className="text-2xl font-black tracking-tight text-[var(--accent)] flex items-center gap-2 border-b-2 border-[var(--foreground)]/10 pb-3 mb-4">
                <Award className="h-5 w-5" />
                Certifications ({certifications.length})
              </h2>
              {certifications.length > 0 ? (
                <ul className="space-y-3">
                  {certifications.map((cert) => (
                    <li key={cert.id}>
                      <Link href={`/certifications/${cert.id}`} className="group block p-3 rounded-xl border border-[var(--foreground)]/10 bg-[var(--surface-soft)] hover:bg-[var(--surface-strong)] transition-all">
                        <div className="font-bold text-sm text-[var(--foreground)] group-hover:text-[var(--accent)]">
                          {cert.title}
                        </div>
                        <p className="text-xs text-[var(--foreground)]/70 mt-0.5">{cert.issuer}</p>
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm font-medium text-[var(--foreground)]/60">No certifications found.</p>
              )}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
