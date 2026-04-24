"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import Link from "next/link";
import { Award, ExternalLink, Sparkles, X } from "lucide-react";
import type { Certification } from "@/app/lib/types";
import { prioritizeFeatured } from "@/app/lib/contentOrdering";
import LoadingSkeleton from "./LoadingSkeleton";
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

  const orderedCertifications = prioritizeFeatured(certifications);
  const visibleCertifications = orderedCertifications.slice(0, 6);
  const hasMore = orderedCertifications.length > visibleCertifications.length;

  return (
    <section className="section-surface relative overflow-hidden px-4 py-16 sm:px-6 md:py-24 lg:px-10">
      <div className="absolute top-0 left-0 h-px w-full bg-gradient-to-r from-cyan-300 via-white/40 to-indigo-300" />

      <div className="mx-auto max-w-[1600px]">
        <motion.div
          initial={reducedMotion ? false : { opacity: 0, y: 50 }}
          whileInView={reducedMotion ? undefined : { opacity: 1, y: 0 }}
          transition={reducedMotion ? undefined : { duration: 0.8 }}
          viewport={{ once: true, amount: 0.2 }}
          className="mb-12 text-center md:mb-16"
        >
          <div className="mx-auto mb-4 inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-300/8 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-cyan-100">
            <Sparkles className="h-3.5 w-3.5" />
            Verified proof
          </div>
          <h2 className="mb-4 bg-gradient-to-r from-cyan-100 via-white to-indigo-200 bg-clip-text text-3xl font-black text-transparent sm:text-4xl md:mb-6 md:text-6xl">
            {siteCopy.certificationsHeading}
          </h2>
          <p className="mx-auto max-w-2xl px-2 text-sm leading-relaxed text-slate-300 sm:text-base md:text-xl">
            {siteCopy.certificationsSubtitle}
          </p>
          <div className="mx-auto mt-4 h-px w-16 bg-gradient-to-r from-cyan-300 to-indigo-300 md:mt-6 md:w-24" />
        </motion.div>

        {loading ? (
          <LoadingSkeleton variant="cards" count={6} />
        ) : (
          <div className="grid auto-rows-fr gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:gap-6 2xl:gap-8">
            {visibleCertifications.length === 0 ? (
              <div className="col-span-full text-center text-slate-400">{siteCopy.certificationsEmpty}</div>
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
                  className="group flex h-full flex-col overflow-hidden rounded-[1.75rem] border border-white/10 bg-[#111827]/95 text-left text-white shadow-[0_20px_50px_rgba(0,0,0,0.3)] transition-all duration-300 hover:border-cyan-300/30 hover:shadow-[0_24px_70px_rgba(0,0,0,0.45)]"
                  onClick={() => setSelectedCert(cert)}
                >
                  <div className="relative aspect-[16/9] overflow-hidden bg-gradient-to-br from-cyan-400/10 via-slate-950/20 to-indigo-400/10">
                    {cert.image ? (
                      <Image
                        src={cert.image}
                        alt={cert.title}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        className="object-cover object-center transition-transform duration-300 group-hover:scale-[1.03]"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center bg-[radial-gradient(circle_at_30%_25%,rgba(34,211,238,0.22)_0%,rgba(99,102,241,0.18)_38%,rgba(15,23,42,0.96)_100%)]">
                        <Award className="h-16 w-16 text-cyan-200" />
                      </div>
                    )}

                    <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/20 via-transparent to-indigo-500/20" />

                    {cert.featured && (
                      <div className="absolute top-4 right-4">
                        <span className="inline-flex items-center rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1 text-xs font-semibold text-cyan-50">
                          Featured
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-1 flex-col space-y-4 p-5 sm:p-6">
                    <div>
                      <h3 className="text-lg font-bold text-white transition-colors group-hover:text-cyan-100 sm:text-xl">
                        {cert.title}
                      </h3>
                      <p className="mt-2 text-sm font-medium text-cyan-100/80">Issuer: {cert.issuer}</p>
                      <p className="mt-1 text-xs uppercase tracking-[0.22em] text-slate-400">
                        Issued {new Date(cert.issuedDate).toLocaleDateString()}
                      </p>
                    </div>

                    <p className="text-sm leading-relaxed text-slate-300">{cert.description}</p>

                    <div className="flex flex-wrap gap-2">
                      {getCertificationTags(cert).map((tag) => (
                        <span key={tag} className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-200">
                          {tag}
                        </span>
                      ))}
                    </div>

                    <div className="mt-auto flex flex-wrap gap-3 pt-1">
                      <span className="inline-flex items-center rounded-full bg-cyan-300 px-4 py-2 text-sm font-semibold text-[#0b0f19] transition hover:scale-[1.02]">
                        View details
                      </span>
                      {cert.credentialUrl ? (
                        <span className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-slate-100 transition group-hover:border-cyan-300/30 group-hover:bg-white/10">
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
        )}

        {!loading && hasMore ? (
          <div className="mt-10 text-center">
            <Link
              href="/certifications"
              className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-6 py-2 text-sm font-semibold text-slate-100 transition hover:border-cyan-300/30 hover:bg-white/10"
            >
              {siteCopy.certificationsViewMore}
            </Link>
          </div>
        ) : null}
      </div>

      {selectedCert && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setSelectedCert(null)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-3 sm:p-4"
        >
          <motion.div
            initial={{ scale: 0.92, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.92, opacity: 0 }}
            onClick={(event) => event.stopPropagation()}
            className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-[1.75rem] border border-white/10 bg-[#111827] shadow-2xl"
          >
            <div className="sticky top-0 flex items-center justify-between border-b border-white/10 bg-[#111827]/95 p-4 sm:p-6">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-200/80">Certification details</p>
                <h2 className="mt-1 pr-3 text-lg font-bold text-white sm:text-2xl">{selectedCert.title}</h2>
              </div>
              <button
                onClick={() => setSelectedCert(null)}
                className="rounded-full border border-white/10 bg-white/5 p-2 text-slate-200 transition hover:border-cyan-300/30 hover:bg-white/10"
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
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Issuer</p>
                  <p className="mt-2 text-lg font-semibold text-white">{selectedCert.issuer}</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Issued</p>
                  <p className="mt-2 text-lg font-semibold text-white">{new Date(selectedCert.issuedDate).toLocaleDateString()}</p>
                </div>
                {selectedCert.expiryDate && (
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Expiry</p>
                    <p className="mt-2 text-lg font-semibold text-white">{new Date(selectedCert.expiryDate).toLocaleDateString()}</p>
                  </div>
                )}
                {selectedCert.credentialId && (
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Credential ID</p>
                    <p className="mt-2 text-lg font-semibold text-white">{selectedCert.credentialId}</p>
                  </div>
                )}
              </div>

              {selectedCert.description && (
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4 sm:p-5">
                  <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Description</p>
                  <p className="mt-3 leading-relaxed text-slate-300">{selectedCert.description}</p>
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
                    className="inline-flex items-center justify-center rounded-full bg-cyan-300 px-5 py-3 font-semibold text-[#0b0f19] transition"
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
                    className="inline-flex items-center justify-center rounded-full border border-white/10 bg-white/5 px-5 py-3 font-semibold text-slate-100 transition hover:border-cyan-300/30 hover:bg-white/10"
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
