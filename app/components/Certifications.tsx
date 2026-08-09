"use client";

import { useEffect, useState, useMemo } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { Award, ExternalLink, Sparkles, X } from "lucide-react";
import type { Certification } from "@/app/lib/types";
import { prioritizeFeatured } from "@/app/lib/contentOrdering";
import LoadingSkeleton from "./LoadingSkeleton";
import ExpandableSection from "./ExpandableSection";
import { useMotionPreferences } from "./MotionProvider";
import { getSiteCopy } from "@/app/lib/siteCopy";

function getCertificationTags(cert: Certification) {
  const blob = `${cert.title} ${cert.issuer} ${cert.description}`.toLowerCase();
  const tags = new Set<string>();

  if (blob.includes("ai") || blob.includes("machine learning") || blob.includes("openai")) tags.add("AI");
  if (blob.includes("cloud") || blob.includes("firebase") || blob.includes("aws") || blob.includes("devops")) tags.add("Cloud");
  if (blob.includes("web") || blob.includes("frontend") || blob.includes("react") || blob.includes("next")) tags.add("Web");
  if (blob.includes("data") || blob.includes("analytics") || blob.includes("sql")) tags.add("Data");
  if (blob.includes("design") || blob.includes("ui") || blob.includes("ux")) tags.add("Design");
  if (blob.includes("security") || blob.includes("auth")) tags.add("Security");
  if (cert.issuer) tags.add(cert.issuer);

  return Array.from(tags).slice(0, 3);
}

import { usePortfolioContent } from "./PortfolioContentProvider";

export default function Certifications() {
  const { content, loading: contentLoading, error: contentError } = usePortfolioContent();
  const { reducedMotion } = useMotionPreferences();
  const [certifications, setCertifications] = useState<Certification[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCert, setSelectedCert] = useState<Certification | null>(null);
  const [error, setError] = useState<Error | null>(null);

  const siteCopy = useMemo(() => getSiteCopy(content), [content]);
  const isVisible = content ? content.sectionVisibility?.certifications !== false : true;

  useEffect(() => {
    const fetchCertifications = async () => {
      try {
        const certificationsRes = await fetch('/api/admin/certifications');
        if (!certificationsRes.ok) throw new Error('Failed to fetch certifications');
        const certificationsData = await certificationsRes.json();
        setCertifications(Array.isArray(certificationsData.certifications) ? certificationsData.certifications : []);
      } catch (err) {
        console.error('Error fetching certifications:', err);
        setError(err instanceof Error ? err : new Error('Failed to load certifications'));
      } finally {
        setLoading(false);
      }
    };

    fetchCertifications();
  }, []);

  useEffect(() => {
    if (selectedCert) {
      const originalStyle = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = originalStyle;
      };
    }
  }, [selectedCert]);

  if ((loading || contentLoading) && isVisible) {
    return (
      <section className="relative px-4 py-24 sm:px-6 lg:py-32 lg:px-10">
        <LoadingSkeleton variant="cards" />
      </section>
    );
  }
  if (!isVisible) return null;

  const orderedCertifications = prioritizeFeatured(certifications);
  const visibleCertifications = orderedCertifications.slice(0, 6);

  return (
    <section className="relative px-4 py-24 sm:px-6 lg:py-32 lg:px-10">
      <div className="mx-auto max-w-[1600px]">
        <motion.div
          initial={reducedMotion ? false : { opacity: 0, y: 30 }}
          whileInView={reducedMotion ? undefined : { opacity: 1, y: 0 }}
          transition={reducedMotion ? undefined : { duration: 0.8, ease: [0.42, 0, 0.58, 1] }}
          viewport={{ once: true, amount: 0.2 }}
          className="mb-16 text-center"
        >
          <div className="paper-chip mx-auto mb-6 inline-flex uppercase tracking-[0.24em] gap-2">
            <Sparkles className="h-4 w-4" />
            Verified proof
          </div>
          <h2 className="mb-6 text-4xl font-black md:text-6xl tracking-tighter text-[var(--foreground)]">
            {siteCopy.certificationsHeading}
          </h2>
          <p className="mx-auto max-w-2xl text-lg md:text-xl font-medium">
            {siteCopy.certificationsSubtitle}
          </p>
          <div className="mx-auto mt-8 h-1 w-24 bg-[var(--foreground)] editorial-border rounded-full" />
        </motion.div>

        {loading ? (
          <LoadingSkeleton variant="cards" count={6} />
        ) : (
          <ExpandableSection collapsedMaxHeightPx={900}>
            <div className="grid auto-rows-fr gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:gap-8 2xl:gap-10">
              {visibleCertifications.length === 0 ? (
                <div className="col-span-full text-center font-bold text-lg">{siteCopy.certificationsEmpty}</div>
              ) : (
                visibleCertifications.map((cert, index) => (
                  <motion.button
                    key={cert.id}
                    type="button"
                    initial={reducedMotion ? false : { opacity: 0, y: 30, scale: 0.98 }}
                    whileInView={reducedMotion ? undefined : { opacity: 1, y: 0, scale: 1 }}
                    transition={reducedMotion ? undefined : { duration: 0.6, delay: index * 0.05, ease: [0.42, 0, 0.58, 1] }}
                    whileHover={reducedMotion ? undefined : { y: -6, scale: 1.01 }}
                    viewport={{ once: true, amount: 0.2 }}
                    className="paper-card group flex h-full flex-col overflow-hidden text-left"
                    onClick={() => setSelectedCert(cert)}
                  >
                    <div className="relative aspect-[16/9] overflow-hidden bg-[var(--surface-soft)] border-b-2 border-[var(--foreground)]">
                      {cert.image ? (
                        <Image
                          src={cert.image}
                          alt={cert.title}
                          fill
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                          className="object-cover object-center transition-transform duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center bg-[var(--surface-strong)]">
                          <Award className="h-16 w-16 text-[var(--foreground)] transition-transform duration-300 group-hover:scale-110 opacity-20" />
                        </div>
                      )}

                      {cert.featured && (
                        <div className="absolute top-4 right-4 z-10">
                          <span className="paper-chip bg-[var(--surface)] text-xs font-bold shadow-sm">
                            Featured
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-1 flex-col space-y-4 p-6 sm:p-8">
                      <div>
                        <h3 className="text-2xl font-black tracking-tight text-[var(--foreground)] transition-colors group-hover:text-[var(--accent)]">
                          {cert.title}
                        </h3>
                        <p className="mt-3 text-sm font-bold text-[var(--foreground)] uppercase tracking-widest">Issuer: {cert.issuer}</p>
                        <p className="mt-2 text-xs font-bold uppercase tracking-widest text-[var(--accent)]">
                          Issued {new Date(cert.issuedDate).toLocaleDateString()}
                        </p>
                      </div>

                      <p className="text-base font-medium leading-relaxed">{cert.description}</p>

                      <div className="flex flex-wrap gap-2 pt-2">
                        {getCertificationTags(cert).map((tag) => (
                          <span key={tag} className="paper-chip px-3 py-1.5 text-xs font-bold bg-[var(--surface-soft)]">
                            {tag}
                          </span>
                        ))}
                      </div>

                      <div className="mt-auto flex flex-wrap gap-3 pt-4">
                        <span className="paper-button-primary text-sm px-5 py-2.5">
                          View details
                        </span>
                        {cert.credentialUrl ? (
                          <span className="paper-button text-sm px-5 py-2.5 bg-white">
                            Credential
                            <ExternalLink className="ml-2 h-4 w-4" />
                          </span>
                        ) : null}
                      </div>
                    </div>
                  </motion.button>
                ))
              )}
            </div>
          </ExpandableSection>
        )}
      </div>

      <AnimatePresence>
        {selectedCert ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedCert(null)}
            className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--foreground)]/40 p-3 backdrop-blur-sm sm:p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(event) => event.stopPropagation()}
              className="paper-card max-h-[90vh] w-full max-w-2xl !overflow-y-auto shadow-2xl"
            >
            <div className="sticky top-0 flex items-center justify-between border-b-2 border-[var(--foreground)] bg-[var(--surface)] p-4 sm:p-6 z-10">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-[var(--accent)]">Certification details</p>
                <h2 className="mt-2 pr-3 text-2xl font-black text-[var(--foreground)]">{selectedCert.title}</h2>
              </div>
              <button
                onClick={() => setSelectedCert(null)}
                className="paper-button p-2"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-6 p-6 sm:p-8">
              {selectedCert.image && (
                <div className="relative aspect-[16/9] w-full overflow-hidden border-2 border-[var(--foreground)] rounded-lg bg-[var(--surface-soft)]">
                  <Image
                    src={selectedCert.image}
                    alt={selectedCert.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 768px"
                    className="object-cover object-center"
                  />
                </div>
              )}

              <div className="grid gap-4 md:grid-cols-2 md:gap-6">
                <div className="paper-card p-5 bg-[var(--surface-soft)] shadow-none">
                  <p className="text-xs font-bold uppercase tracking-widest text-[var(--accent)]">Issuer</p>
                  <p className="mt-2 text-xl font-black text-[var(--foreground)]">{selectedCert.issuer}</p>
                </div>
                <div className="paper-card p-5 shadow-none bg-white">
                  <p className="text-xs font-bold uppercase tracking-widest text-[var(--accent)]">Issued</p>
                  <p className="mt-2 text-xl font-black text-[var(--foreground)]">{new Date(selectedCert.issuedDate).toLocaleDateString()}</p>
                </div>
                {selectedCert.expiryDate && (
                  <div className="paper-card p-5 shadow-none bg-white">
                    <p className="text-xs font-bold uppercase tracking-widest text-[var(--accent)]">Expiry</p>
                    <p className="mt-2 text-xl font-black text-[var(--foreground)]">{new Date(selectedCert.expiryDate).toLocaleDateString()}</p>
                  </div>
                )}
                {selectedCert.credentialId && (
                  <div className="paper-card p-5 shadow-none bg-white">
                    <p className="text-xs font-bold uppercase tracking-widest text-[var(--accent)]">Credential ID</p>
                    <p className="mt-2 text-xl font-black text-[var(--foreground)]">{selectedCert.credentialId}</p>
                  </div>
                )}
              </div>

              {selectedCert.description && (
                <div className="paper-card p-5 sm:p-6 bg-[var(--surface-soft)] shadow-none">
                  <p className="text-xs font-bold uppercase tracking-widest text-[var(--accent)]">Description</p>
                  <p className="mt-3 text-base font-medium leading-relaxed">{selectedCert.description}</p>
                </div>
              )}

              <div className="flex flex-wrap gap-4 pt-4">
                {selectedCert.credentialUrl && (
                  <motion.a
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    href={selectedCert.credentialUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="paper-button-primary px-6 py-3"
                  >
                    <ExternalLink className="mr-2 h-5 w-5" />
                    View credential
                  </motion.a>
                )}
                {selectedCert.linkedinUrl && (
                  <motion.a
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    href={selectedCert.linkedinUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="paper-button bg-white px-6 py-3"
                  >
                    <ExternalLink className="mr-2 h-5 w-5" />
                    View on LinkedIn
                  </motion.a>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
        ) : null}
      </AnimatePresence>
    </section>
  );
}
