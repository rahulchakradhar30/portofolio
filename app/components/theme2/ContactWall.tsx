"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { usePortfolioContent } from "../PortfolioContentProvider";
import { getSiteCopy } from "@/app/lib/siteCopy";
import { resolveLink } from "@/app/lib/urlPolicy";
import LoadingSkeleton from "../LoadingSkeleton";
import { Mail, ArrowRight, Briefcase, Globe, ExternalLink } from "lucide-react";

export default function ContactWall() {
  const { content, loading } = usePortfolioContent();
  const siteCopy = useMemo(() => getSiteCopy(content), [content]);

  const contactData = useMemo(() => {
    const rawEmail = content?.email || "rahulchakradharperepogu@gmail.com";
    return {
      heading: siteCopy.contactHeading || "Get In Touch",
      subtitle: siteCopy.contactSubtitle || "Let's collaborate on AI models, web applications, and innovative products.",
      email: rawEmail,
    };
  }, [content, siteCopy]);

  const githubRes = useMemo(() => resolveLink(content?.github, "github"), [content]);
  const linkedinRes = useMemo(() => resolveLink(content?.linkedin, "linkedin"), [content]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSkeleton variant="contact" />
      </div>
    );
  }

  return (
    <div className="relative w-full h-full p-6 sm:p-10 md:p-12 xl:p-16 flex flex-col justify-between overflow-hidden select-none">
      {/* Background Glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,var(--accent)_0%,transparent_60%)] opacity-20 pointer-events-none" />

      {/* Header Tag */}
      <div className="relative z-10 flex items-center justify-between">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-[var(--accent)]/40 bg-[#0d0f17]/80 backdrop-blur-md">
          <Mail className="w-3.5 h-3.5 text-[var(--accent)] animate-pulse" />
          <span className="text-[10px] md:text-xs font-bold tracking-widest uppercase text-white/90">
            EXHIBIT // CONTACT & HIRE
          </span>
        </div>
        <div className="hidden sm:flex items-center gap-2 text-[10px] md:text-xs font-mono uppercase text-white/50 tracking-wider">
          FINAL EXHIBIT
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center my-auto">
        {/* Left Column: Heading & Information */}
        <div className="lg:col-span-7 space-y-6 text-left">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl sm:text-6xl md:text-7xl font-black tracking-tight text-white drop-shadow-[0_4px_24px_rgba(0,0,0,0.8)]">
              {contactData.heading}
            </h2>
            <p className="mt-4 text-base sm:text-2xl font-medium text-white/85 max-w-xl leading-relaxed">
              {contactData.subtitle}
            </p>
          </motion.div>

          {/* Email Direct Action */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="pt-2"
          >
            <a
              href={`mailto:${contactData.email}`}
              className="inline-flex items-center gap-3 px-6 py-4 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 backdrop-blur-xl text-white font-bold text-sm sm:text-base transition-all hover:scale-105 group shadow-2xl"
            >
              <Mail className="w-5 h-5 text-[var(--accent)] group-hover:rotate-12 transition-transform" />
              <span>{contactData.email}</span>
            </a>
          </motion.div>

          {/* Social Links */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            {githubRes.shouldDisplay && githubRes.url && (
              <a
                href={githubRes.url}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/15 border border-white/10 font-mono text-xs text-white/80 hover:text-white transition-all flex items-center gap-2"
              >
                <Globe className="w-4 h-4 text-[var(--accent)]" />
                <span>GITHUB</span>
              </a>
            )}
            {linkedinRes.shouldDisplay && linkedinRes.url && (
              <a
                href={linkedinRes.url}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/15 border border-white/10 font-mono text-xs text-white/80 hover:text-white transition-all flex items-center gap-2"
              >
                <ExternalLink className="w-4 h-4 text-[var(--accent)]" />
                <span>LINKEDIN</span>
              </a>
            )}
          </div>
        </div>

        {/* Right Column: Hire Me CTA Card */}
        <div className="lg:col-span-5">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="p-6 sm:p-8 rounded-2xl bg-gradient-to-br from-white/15 via-white/5 to-[var(--accent)]/25 border border-white/20 backdrop-blur-xl shadow-2xl space-y-5 text-left"
          >
            <div className="w-12 h-12 rounded-xl bg-[var(--accent)]/20 border border-[var(--accent)]/40 flex items-center justify-center">
              <Briefcase className="w-6 h-6 text-[var(--accent)]" />
            </div>

            <div>
              <h3 className="text-2xl font-black text-white">Work Together</h3>
              <p className="text-xs sm:text-sm text-white/70 mt-1 leading-relaxed">
                Available for freelance projects, AI software engineering roles, and innovative collaborations.
              </p>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row gap-3">
              <Link
                href="/hire"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-bold text-sm text-black bg-[var(--accent)] hover:bg-[var(--accent-strong)] transition-all shadow-[0_0_20px_rgba(255,255,255,0.2)] hover:shadow-[0_0_25px_var(--accent)] hover:scale-105 active:scale-95"
              >
                <span>Hire Me</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/proof-mode"
                className="inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl font-semibold text-sm text-white/90 bg-white/10 hover:bg-white/20 border border-white/15 transition-all backdrop-blur-md"
              >
                <span>Proof Mode</span>
              </Link>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Footer */}
      <div className="relative z-10 flex items-center justify-between text-[11px] font-mono text-white/40 pt-4 border-t border-white/10">
        <div>CONTACT EXHIBIT</div>
        <div className="hidden sm:block">REAL ADMIN COMMUNICATION DATA</div>
      </div>
    </div>
  );
}
