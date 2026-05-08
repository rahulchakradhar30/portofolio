"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
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

export default function Certifications() {
  const { reducedMotion } = useMotionPreferences();
  const [certifications, setCertifications] = useState<Certification[]>([]);
  const [siteCopy, setSiteCopy] = useState(getSiteCopy(null));
  const [isVisible, setIsVisible] = useState(true);
  const [loading, setLoading] = useState(true);
  const [selectedCert, setSelectedCert] = useState<Certification | null>(null);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchCertifications = async () => {
      try {
        const [certificationsRes, contentRes] = await Promise.all([
          fetch('/api/admin/certifications'),
          fetch('/api/admin/content'),
        ]);

        if (!certificationsRes.ok) throw new Error('Failed to fetch certifications');

        const certificationsData = await certificationsRes.json();
        setCertifications(Array.isArray(certificationsData.certifications) ? certificationsData.certifications : []);

        if (contentRes.ok) {
          const contentData = await contentRes.json();
          if (contentData.content) {
            setIsVisible(contentData.content.sectionVisibility?.certifications !== false);
            setSiteCopy(getSiteCopy(contentData.content));
          }
        }
      } catch (fetchError) {
        console.error('Error fetching certifications:', fetchError);
        setError(fetchError instanceof Error ? fetchError : new Error('Failed to load certifications'));
      } finally {
        setLoading(false);
      }
    };

    fetchCertifications();
  }, []);

  if (error) throw error;
  if (!loading && !isVisible) return null;

  const orderedCertifications = prioritizeFeatured(certifications);
  const visibleCertifications = orderedCertifications.slice(0, 6);

  return (
    <section className="section-surface relative min-h-screen overflow-hidden px-4 py-16 sm:px-6 md:py-24 lg:px-10">
      <div className="absolute top-0 left-0 h-px w-full bg-gradient-to-r from-[#8d6b4e] via-white/60 to-[#c4a884]" />

      <div className="mx-auto max-w-[1600px]">
        <motion.div
          initial={reducedMotion ? false : { opacity: 0, y: 50 }}
          whileInView={reducedMotion ? undefined : { opacity: 1, y: 0 }}
          transition={reducedMotion ? undefined : { duration: 0.8 }}
          viewport={{ once: true, amount: 0.2 }}
          className="mb-12 text-center md:mb-16"
        >
          <div className="mx-auto mb-4 inline-flex items-center gap-2 rounded-full border border-[#7a5f47]/15 bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-[#7a5f47]">
            <Sparkles className="h-3.5 w-3.5" />
            Verified proof
          </div>
          <h2 className="mb-4 bg-gradient-to-r from-[#7a5f47] via-[#b6926d] to-[#9b7a5b] bg-clip-text text-3xl font-black text-transparent sm:text-4xl md:mb-6 md:text-6xl">
            {siteCopy.certificationsHeading}
          </h2>
          <p className="mx-auto max-w-2xl px-2 text-sm leading-relaxed text-[#6a5846] sm:text-base md:text-xl">
            {siteCopy.certificationsSubtitle}
          </p>
          <div className="mx-auto mt-4 h-px w-16 bg-gradient-to-r from-[#8d6b4e] to-[#c4a884] md:mt-6 md:w-24" />
        </motion.div>

        {loading ? (
          <LoadingSkeleton variant="cards" count={6} />
        ) : (
          <ExpandableSection collapsedMaxHeightPx={900}>
            <div className="grid auto-rows-fr gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:gap-6 2xl:gap-8">
              {visibleCertifications.length === 0 ? (
                <div className="col-span-full text-center text-[#7a5f47]">{siteCopy.certificationsEmpty}</div>
              ) : (
                visibleCertifications.map((cert, index) => (
                  <motion.button
                    key={cert.id}
                    type="button"
                    initial={reducedMotion ? false : { opacity: 0, y: 40 }}
                    whileInView={reducedMotion ? undefined : { opacity: 1, y: 0 }}
                    transition={reducedMotion ? undefined : { duration: 0.55, delay: index * 0.08 }}
                    whileHover={reducedMotion ? undefined : { y: -10 }}
                    viewport={{ once: true, amount: 0.25 }}
                    className="group flex h-full flex-col overflow-hidden rounded-[1.75rem] border border-[#7a5f47]/12 bg-white text-left text-[#2f241b] shadow-[0_20px_50px_rgba(122,95,71,0.1)] transition-all duration-300 hover:border-[#8d6b4e]/30 hover:shadow-[0_24px_70px_rgba(122,95,71,0.16)]"
                    onClick={() => setSelectedCert(cert)}
                  >
                    <div className="relative aspect-[16/9] overflow-hidden bg-gradient-to-br from-[#f7efe4] via-[#fdfaf5] to-[#ede0cf]">
                      {cert.image ? (
                        <Image
                          src={cert.image}
                          alt={cert.title}
                          fill
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                          className="object-cover object-center transition-transform duration-300 group-hover:scale-[1.03]"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center bg-[radial-gradient(circle_at_30%_25%,rgba(235,216,188,0.55)_0%,rgba(196,168,132,0.28)_38%,#f7efe4_100%)]">
                          <Award className="h-16 w-16 text-[#8d6b4e]" />
                        </div>
                      )}

                      <div className="absolute inset-0 bg-gradient-to-br from-[#c4a884]/18 via-transparent to-[#b6926d]/18" />

                      {cert.featured && (
                        <div className="absolute top-4 right-4">
                          <span className="inline-flex items-center rounded-full border border-[#7a5f47]/15 bg-white/90 px-3 py-1 text-xs font-semibold text-[#7a5f47]">
                            Featured
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-1 flex-col space-y-4 p-5 sm:p-6">
                      <div>
                        <h3 className="text-lg font-bold text-[#2f241b] transition-colors group-hover:text-[#8d6b4e] sm:text-xl">
                          {cert.title}
                        </h3>
                        <p className="mt-2 text-sm font-medium text-[#7a5f47]">Issuer: {cert.issuer}</p>
                        <p className="mt-1 text-xs uppercase tracking-[0.22em] text-[#8d6b4e]">
                          Issued {new Date(cert.issuedDate).toLocaleDateString()}
                        </p>
                      </div>

                      <p className="text-sm leading-relaxed text-[#6a5846]">{cert.description}</p>

                      <div className="flex flex-wrap gap-2">
                        {getCertificationTags(cert).map((tag) => (
                          <span key={tag} className="rounded-full border border-[#7a5f47]/12 bg-[#fbf7f0] px-3 py-1 text-xs text-[#6a5846]">
                            {tag}
                          </span>
                        ))}
                      </div>

                      <div className="mt-auto flex flex-wrap gap-3 pt-1">
                        <span className="inline-flex items-center rounded-full bg-[#8d6b4e] px-4 py-2 text-sm font-semibold text-[#fffaf3] transition hover:scale-[1.02]">
                          View details
                        </span>
                        {cert.credentialUrl ? (
                          <span className="inline-flex items-center rounded-full border border-[#7a5f47]/12 bg-white px-4 py-2 text-sm font-semibold text-[#5f4a38] transition group-hover:border-[#8d6b4e]/30 group-hover:bg-[#f7efe4]">
                            Credential available
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

      {selectedCert && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setSelectedCert(null)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#2f241b]/40 p-3 sm:p-4"
        >
          <motion.div
            initial={{ scale: 0.92, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.92, opacity: 0 }}
            onClick={(event) => event.stopPropagation()}
            className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-[1.75rem] border border-[#7a5f47]/12 bg-white shadow-2xl"
          >
            <div className="sticky top-0 flex items-center justify-between border-b border-[#7a5f47]/10 bg-white/95 p-4 sm:p-6">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#8d6b4e]">Certification details</p>
                <h2 className="mt-1 pr-3 text-lg font-bold text-[#2f241b] sm:text-2xl">{selectedCert.title}</h2>
              </div>
              <button
                onClick={() => setSelectedCert(null)}
                className="rounded-full border border-[#7a5f47]/12 bg-white p-2 text-[#5f4a38] transition hover:border-[#8d6b4e]/30 hover:bg-[#f7efe4]"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-6 p-4 sm:p-8">
              {selectedCert.image && (
                <div className="relative aspect-[16/9] w-full overflow-hidden rounded-2xl bg-gradient-to-br from-cyan-400/10 via-slate-950/20 to-indigo-400/10">
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
                <div className="rounded-2xl border border-[#7a5f47]/10 bg-[#fbf7f0] p-4">
                  <p className="text-xs uppercase tracking-[0.24em] text-[#8d6b4e]">Issuer</p>
                  <p className="mt-2 text-lg font-semibold text-[#2f241b]">{selectedCert.issuer}</p>
                </div>
                <div className="rounded-2xl border border-[#7a5f47]/10 bg-white p-4">
                  <p className="text-xs uppercase tracking-[0.24em] text-[#8d6b4e]">Issued</p>
                  <p className="mt-2 text-lg font-semibold text-[#2f241b]">{new Date(selectedCert.issuedDate).toLocaleDateString()}</p>
                </div>
                {selectedCert.expiryDate && (
                  <div className="rounded-2xl border border-[#7a5f47]/10 bg-white p-4">
                    <p className="text-xs uppercase tracking-[0.24em] text-[#8d6b4e]">Expiry</p>
                    <p className="mt-2 text-lg font-semibold text-[#2f241b]">{new Date(selectedCert.expiryDate).toLocaleDateString()}</p>
                  </div>
                )}
                {selectedCert.credentialId && (
                  <div className="rounded-2xl border border-[#7a5f47]/10 bg-white p-4">
                    <p className="text-xs uppercase tracking-[0.24em] text-[#8d6b4e]">Credential ID</p>
                    <p className="mt-2 text-lg font-semibold text-[#2f241b]">{selectedCert.credentialId}</p>
                  </div>
                )}
              </div>

              {selectedCert.description && (
                <div className="rounded-2xl border border-[#7a5f47]/10 bg-[#fbf7f0] p-4 sm:p-5">
                  <p className="text-xs uppercase tracking-[0.24em] text-[#8d6b4e]">Description</p>
                  <p className="mt-3 leading-relaxed text-[#6a5846]">{selectedCert.description}</p>
                </div>
              )}

              <div className="flex flex-wrap gap-3 pt-2">
                {selectedCert.credentialUrl && (
                  <motion.a
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    href={selectedCert.credentialUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center rounded-full bg-[#8d6b4e] px-5 py-3 font-semibold text-[#fffaf3] transition"
                  >
                    <ExternalLink className="mr-2 h-4 w-4" />
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
                    className="inline-flex items-center justify-center rounded-full border border-[#7a5f47]/12 bg-white px-5 py-3 font-semibold text-[#5f4a38] transition hover:border-[#8d6b4e]/30 hover:bg-[#f7efe4]"
                  >
                    <ExternalLink className="mr-2 h-4 w-4" />
                    View on LinkedIn
                  </motion.a>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </section>
  );
}
