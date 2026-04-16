"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import Link from "next/link";
import { ExternalLink, Award, X } from "lucide-react";
import type { Certification } from "@/app/lib/types";
import LoadingSkeleton from "./LoadingSkeleton";
import { useMotionPreferences } from "./MotionProvider";

export default function Certifications() {
  const { reducedMotion } = useMotionPreferences();
  const [certifications, setCertifications] = useState<Certification[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCert, setSelectedCert] = useState<Certification | null>(null);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchCertifications = async () => {
      try {
        const res = await fetch('/api/admin/certifications');
        if (res.ok) {
          const data = await res.json();
          setCertifications(data.certifications || []);
        } else {
          throw new Error('Failed to fetch certifications');
        }
      } catch (error) {
        console.error('Error fetching certifications:', error);
        setError(error instanceof Error ? error : new Error('Failed to load certifications'));
      } finally {
        setLoading(false);
      }
    };

    fetchCertifications();
  }, []);

  if (error) throw error;

  const featuredCertifications = certifications.filter((cert) => cert.featured);
  const visibleCertifications = (featuredCertifications.length > 0 ? featuredCertifications : certifications).slice(0, 6);
  const hasMore = (featuredCertifications.length > 0 ? featuredCertifications.length : certifications.length) > visibleCertifications.length;

  return (
    <section className="section-surface relative overflow-hidden px-4 py-16 sm:px-6 md:py-24 lg:px-10">
      <div className="absolute top-0 left-0 h-1 w-full bg-gradient-to-r from-emerald-300 via-cyan-300 to-amber-300"></div>

      <div className="mx-auto max-w-[1600px]">
        <motion.div
          initial={reducedMotion ? false : { opacity: 0, y: 50 }}
          whileInView={reducedMotion ? undefined : { opacity: 1, y: 0 }}
          transition={reducedMotion ? undefined : { duration: 0.8 }}
          viewport={{ once: true, amount: 0.2 }}
          className="text-center mb-16"
        >
          <h2 className="mb-6 bg-gradient-to-r from-[#0d1b2d] to-[#0f766e] bg-clip-text text-4xl font-black text-transparent md:text-6xl">
            Certifications
          </h2>
          <p className="mx-auto max-w-2xl text-base text-slate-700 md:text-xl">
            Professional certifications and credentials validating my expertise
          </p>
          <div className="mx-auto mt-6 h-1 w-24 bg-gradient-to-r from-amber-300 to-cyan-300"></div>
        </motion.div>

        {loading ? (
          <LoadingSkeleton variant="cards" count={6} />
        ) : (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3 2xl:gap-8">
            {visibleCertifications.length === 0 ? (
              <div className="col-span-full text-center text-gray-500">No certifications found.</div>
            ) : (
              visibleCertifications.map((cert, index) => (
                <motion.div
                  key={cert.id}
                  initial={reducedMotion ? false : { opacity: 0, y: 40 }}
                  whileInView={reducedMotion ? undefined : { opacity: 1, y: 0 }}
                  transition={reducedMotion ? undefined : { duration: 0.55, delay: index * 0.08 }}
                  whileHover={reducedMotion ? undefined : { y: -10 }}
                  viewport={{ once: true, amount: 0.25 }}
                  className="group cursor-pointer overflow-hidden rounded-3xl border border-cyan-100 bg-white shadow-lg transition-all duration-300 hover:shadow-2xl"
                  onClick={() => setSelectedCert(cert)}
                >
                  {/* Certificate Image */}
                  <div className="relative flex h-56 items-center justify-center overflow-hidden bg-gradient-to-br from-cyan-100 to-emerald-100">
                    {cert.image ? (
                      <Image
                        src={cert.image}
                        alt={cert.title}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        className="object-cover transition-transform duration-300 group-hover:scale-110"
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center">
                        <Award className="mb-2 h-16 w-16 text-cyan-500" />
                        <span className="text-gray-500">Certificate</span>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                      <span className="text-white text-sm font-semibold">See Details</span>
                    </div>
                    {cert.featured && (
                      <div className="absolute top-4 right-4">
                        <span className="px-3 py-1 bg-yellow-400 text-yellow-900 text-xs font-bold rounded-full flex items-center">
                          ⭐ Featured
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Certificate Info */}
                  <div className="p-6">
                    <h3 className="mb-2 text-xl font-bold text-slate-800 transition-colors group-hover:text-cyan-700">
                      {cert.title}
                    </h3>
                    <p className="text-gray-600 text-sm mb-1">
                      <span className="font-semibold">Issuer:</span> {cert.issuer}
                    </p>
                    <p className="text-gray-500 text-sm mb-4">
                      Issued: {new Date(cert.issuedDate).toLocaleDateString()}
                    </p>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedCert(cert);
                      }}
                      className="w-full rounded-lg bg-gradient-to-r from-cyan-500 to-emerald-500 px-4 py-2 font-semibold text-white transition-all duration-300 hover:shadow-lg"
                    >
                      View Details
                    </button>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        )}

        {!loading && hasMore ? (
          <div className="mt-10 text-center">
            <Link
              href="/certifications"
              className="inline-flex items-center rounded-full border border-cyan-200 bg-white px-6 py-2 text-sm font-semibold text-cyan-700 transition hover:bg-cyan-50"
            >
              View More Certifications
            </Link>
          </div>
        ) : null}
      </div>

      {/* Modal for Certificate Details */}
      {selectedCert && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setSelectedCert(null)}
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="sticky top-0 bg-white flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-800">{selectedCert.title}</h2>
              <button
                onClick={() => setSelectedCert(null)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-6 h-6 text-gray-600" />
              </button>
            </div>

            <div className="p-8 space-y-6">
              {/* Certificate Image */}
              {selectedCert.image && (
                <div className="relative flex h-64 w-full items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-cyan-100 to-emerald-100">
                  <Image
                    src={selectedCert.image}
                    alt={selectedCert.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 768px"
                    className="object-cover"
                  />
                </div>
              )}

              {/* Basic Info */}
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Issuer</p>
                  <p className="text-lg font-semibold text-gray-800">{selectedCert.issuer}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Issued Date</p>
                  <p className="text-lg font-semibold text-gray-800">
                    {new Date(selectedCert.issuedDate).toLocaleDateString()}
                  </p>
                </div>
                {selectedCert.expiryDate && (
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">Expiry Date</p>
                    <p className="text-lg font-semibold text-gray-800">
                      {new Date(selectedCert.expiryDate).toLocaleDateString()}
                    </p>
                  </div>
                )}
              </div>

              {/* Description */}
              {selectedCert.description && (
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-2">Description</p>
                  <p className="text-gray-700 leading-relaxed">{selectedCert.description}</p>
                </div>
              )}

              {/* Credential Links */}
              <div className="flex flex-col gap-3 pt-4 border-t border-gray-200">
                {selectedCert.credentialUrl && (
                  <motion.a
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    href={selectedCert.credentialUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors"
                  >
                    <ExternalLink className="w-5 h-5" />
                    View Credential
                  </motion.a>
                )}
                {selectedCert.linkedinUrl && (
                  <motion.a
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    href={selectedCert.linkedinUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-700 hover:bg-blue-800 text-white rounded-lg font-semibold transition-colors"
                  >
                    <ExternalLink className="w-5 h-5" />
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
