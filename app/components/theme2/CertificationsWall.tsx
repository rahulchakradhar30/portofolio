"use client";

import React, { useMemo } from "react";
import { motion } from "framer-motion";
import { usePortfolioContent } from "../PortfolioContentProvider";
import type { Certification } from "@/app/lib/types";
import LoadingSkeleton from "../LoadingSkeleton";
import { Award, ExternalLink, Calendar } from "lucide-react";

export default function CertificationsWall() {
  const { content, loading } = usePortfolioContent();

  const certifications = useMemo<Certification[]>(() => {
    if (content?.certifications && content.certifications.length > 0) {
      return content.certifications;
    }
    return [
      {
        id: "cert-1",
        title: "AI & Machine Learning Certification",
        issuer: "Global Tech Institute",
        issuedDate: "2024",
        credentialId: "CERT-AI-2024",
        credentialUrl: "https://example.com",
        image: "",
        description: "Advanced machine learning, deep neural networks, and model deployment.",
        featured: true,
      },
    ];
  }, [content]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSkeleton variant="cards" />
      </div>
    );
  }

  return (
    <div className="relative w-full h-full p-6 sm:p-10 md:p-12 xl:p-16 flex flex-col justify-between overflow-hidden select-none">
      {/* Background Glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_30%,var(--accent)_0%,transparent_60%)] opacity-15 pointer-events-none" />

      {/* Header Tag */}
      <div className="relative z-10 flex items-center justify-between">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-[var(--accent)]/40 bg-[#0d0f17]/80 backdrop-blur-md">
          <Award className="w-3.5 h-3.5 text-[var(--accent)]" />
          <span className="text-[10px] md:text-xs font-bold tracking-widest uppercase text-white/90">
            EXHIBIT // CERTIFICATIONS
          </span>
        </div>
        <div className="hidden sm:flex items-center gap-2 text-[10px] md:text-xs font-mono uppercase text-white/50 tracking-wider">
          VERIFIED CREDENTIALS
        </div>
      </div>

      {/* Title */}
      <div className="relative z-10 text-left my-2">
        <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-white drop-shadow-[0_4px_24px_rgba(0,0,0,0.8)]">
          Certifications & Credentials
        </h2>
      </div>

      {/* Certifications Cards Grid */}
      <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 my-auto">
        {certifications.slice(0, 3).map((cert: Certification, idx: number) => (
          <motion.div
            key={cert.id || idx}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: idx * 0.1 }}
            className="p-5 rounded-2xl bg-gradient-to-br from-white/10 via-white/5 to-[var(--accent)]/15 border border-white/15 backdrop-blur-xl shadow-2xl text-left flex flex-col justify-between space-y-4 hover:border-[var(--accent)]/50 transition-all hover:scale-[1.02]"
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-1 rounded-md text-[10px] font-mono font-bold uppercase tracking-wider text-[var(--accent)] bg-[var(--accent)]/15 border border-[var(--accent)]/30">
                  VERIFIED
                </span>
                {cert.issuedDate && (
                  <div className="flex items-center gap-1.5 text-xs font-mono text-white/60">
                    <Calendar className="w-3.5 h-3.5 text-[var(--accent)]" />
                    <span>{cert.issuedDate}</span>
                  </div>
                )}
              </div>

              <h3 className="mt-3 text-lg font-black text-white leading-snug">
                {cert.title}
              </h3>
              <p className="text-xs font-semibold text-white/80 mt-0.5">
                {cert.issuer}
              </p>

              {cert.description && (
                <p className="mt-2 text-xs text-white/60 line-clamp-2 leading-relaxed">
                  {cert.description}
                </p>
              )}
            </div>

            {cert.credentialUrl && (
              <div className="pt-2 border-t border-white/10">
                <a
                  href={cert.credentialUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono text-white/90 bg-white/10 hover:bg-white/20 border border-white/15 transition-all"
                >
                  <span>Verify Credential</span>
                  <ExternalLink className="w-3.5 h-3.5 text-[var(--accent)]" />
                </a>
              </div>
            )}
          </motion.div>
        ))}
      </div>

      {/* Footer */}
      <div className="relative z-10 flex items-center justify-between text-[11px] font-mono text-white/40 pt-4 border-t border-white/10">
        <div>CERTIFICATIONS EXHIBIT</div>
        <div className="hidden sm:block">REAL ADMIN CREDENTIALS</div>
      </div>
    </div>
  );
}
