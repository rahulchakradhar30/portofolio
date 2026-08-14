"use client";

import React, { useMemo } from "react";
import { motion } from "framer-motion";
import { usePortfolioContent } from "../../PortfolioContentProvider";
import { Award, ExternalLink, Calendar, CheckCircle2 } from "lucide-react";

export default function CertificationsWall() {
  const { content } = usePortfolioContent();

  const certs = useMemo(() => {
    return [
      {
        id: "cert1",
        title: "Google Cloud Professional Data Engineer / AI",
        issuer: "Google Cloud",
        issuedDate: "2024",
        credentialUrl: "https://cloud.google.com",
        featured: true,
      },
      {
        id: "cert2",
        title: "Deep Learning Specialization",
        issuer: "Coursera / DeepLearning.AI",
        issuedDate: "2023",
        credentialUrl: "https://coursera.org",
        featured: true,
      },
    ];
  }, []);

  return (
    <div className="w-full h-full flex flex-col justify-between p-4 sm:p-8 lg:p-12 text-white select-none">
      {/* Wall Header */}
      <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-6">
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-md bg-[var(--accent)]/20 border border-[var(--accent)] text-[var(--accent)] text-xs font-mono font-bold uppercase tracking-widest flex items-center gap-1.5">
            <Award className="w-3.5 h-3.5" />
            <span>EXHIBIT 08</span>
          </span>
          <span className="text-xs font-mono text-white/40">// CERTIFICATIONS</span>
        </div>
        <div className="text-xs font-mono text-white/40">CREDENTIAL GALLERY</div>
      </div>

      {/* Body */}
      <div className="my-auto space-y-6 max-w-5xl w-full">
        <div>
          <span className="text-xs font-mono font-bold text-[var(--accent)] uppercase tracking-widest block mb-1">
            VERIFIED LICENSES & CERTIFICATIONS
          </span>
          <h2 className="text-3xl sm:text-5xl font-black uppercase tracking-tight text-white">
            CERTIFICATE GALLERY
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          {certs.map((cert, idx) => (
            <motion.div
              key={cert.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="p-5 rounded-2xl bg-white/[0.04] border border-white/10 hover:border-[var(--accent)]/50 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between text-xs font-mono text-white/60 mb-2">
                  <span className="text-[var(--accent)] font-bold">{cert.issuer}</span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-white/40" />
                    <span>{cert.issuedDate}</span>
                  </span>
                </div>

                <h3 className="text-lg font-bold font-mono text-white mb-4">{cert.title}</h3>
              </div>

              {cert.credentialUrl && (
                <a
                  href={cert.credentialUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-mono font-bold text-white uppercase flex items-center justify-between transition-colors mt-2"
                >
                  <span>VIEW CERTIFICATE</span>
                  <ExternalLink className="w-3.5 h-3.5 text-[var(--accent)]" />
                </a>
              )}
            </motion.div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="pt-6 border-t border-white/10 flex items-center justify-between text-xs font-mono text-white/40">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-3.5 h-3.5 text-[var(--accent)]" />
          <span>VERIFIED CREDENTIAL GALLERY</span>
        </div>
        <div>EXHIBIT PANEL 08</div>
      </div>
    </div>
  );
}
