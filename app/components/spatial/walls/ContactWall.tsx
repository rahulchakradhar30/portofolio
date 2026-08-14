"use client";

import React, { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { usePortfolioContent } from "../../PortfolioContentProvider";
import { getSiteCopy } from "@/app/lib/siteCopy";
import { Mail, Send, CheckCircle2, MessageSquare, Briefcase } from "lucide-react";

export default function ContactWall() {
  const { content } = usePortfolioContent();
  const siteCopy = useMemo(() => getSiteCopy(content), [content]);

  const [formState, setFormState] = useState({ name: "", email: "", message: "" });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="w-full h-full flex flex-col justify-between p-4 sm:p-8 lg:p-12 text-white select-none">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-6">
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-md bg-[var(--accent)]/20 border border-[var(--accent)] text-[var(--accent)] text-xs font-mono font-bold uppercase tracking-widest flex items-center gap-1.5">
            <Mail className="w-3.5 h-3.5" />
            <span>EXHIBIT 10</span>
          </span>
          <span className="text-xs font-mono text-white/40">// CONNECT & HIRE</span>
        </div>
        <div className="text-xs font-mono text-white/40">EXHIBIT CONCLUSION</div>
      </div>

      {/* Body */}
      <div className="my-auto space-y-6 max-w-4xl w-full">
        <div>
          <span className="text-xs font-mono font-bold text-[var(--accent)] uppercase tracking-widest block mb-1">
            {siteCopy.contactHeading || "LET'S BUILD SOMETHING EXTRAORDINARY"}
          </span>
          <h2 className="text-3xl sm:text-5xl font-black uppercase tracking-tight text-white">
            GET IN TOUCH
          </h2>
        </div>

        <p className="text-sm sm:text-base text-white/80 font-sans leading-relaxed">
          {siteCopy.contactSubtitle || "Open for AI/ML Engineering roles, Full Stack Development, and High-Impact Projects."}
        </p>

        {/* Contact Form / Info Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-white/[0.04] border border-white/10">
              <div className="text-xs font-mono text-white/50 mb-1">EMAIL DIRECT</div>
              <a href={`mailto:${content?.email || "rahul@example.com"}`} className="text-sm font-mono font-bold text-[var(--accent)] hover:underline">
                {content?.email || "rahulchakradhar30@gmail.com"}
              </a>
            </div>

            <div className="p-4 rounded-xl bg-white/[0.04] border border-white/10">
              <div className="text-xs font-mono text-white/50 mb-1">LOCATION</div>
              <div className="text-sm font-mono text-white">{content?.location || "Bengaluru, India"}</div>
            </div>

            <div className="flex gap-3">
              {content?.github && (
                <a href={content.github} target="_blank" rel="noopener noreferrer" className="flex-1 py-2.5 text-center rounded-xl bg-white/10 hover:bg-white/20 text-xs font-mono font-bold text-white transition-colors">
                  GITHUB
                </a>
              )}
              {content?.linkedin && (
                <a href={content.linkedin} target="_blank" rel="noopener noreferrer" className="flex-1 py-2.5 text-center rounded-xl bg-white/10 hover:bg-white/20 text-xs font-mono font-bold text-white transition-colors">
                  LINKEDIN
                </a>
              )}
            </div>
          </div>

          {/* Quick Message Panel */}
          <div className="p-5 rounded-2xl bg-white/[0.04] border border-white/10">
            {submitted ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-4 space-y-2">
                <CheckCircle2 className="w-8 h-8 text-[var(--accent)]" />
                <h4 className="font-bold text-white">MESSAGE TRANSMITTED</h4>
                <p className="text-xs text-white/60">Thank you. Your message has been recorded.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-3">
                <div className="text-xs font-mono font-bold text-[var(--accent)] mb-2 uppercase">DIRECT EXHIBIT MESSAGE</div>
                <input
                  type="text"
                  placeholder="Your Name"
                  required
                  value={formState.name}
                  onChange={(e) => setFormState({ ...formState, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-white/[0.06] border border-white/15 text-xs font-mono text-white placeholder-white/40 focus:outline-none focus:border-[var(--accent)]"
                />
                <input
                  type="email"
                  placeholder="Your Email"
                  required
                  value={formState.email}
                  onChange={(e) => setFormState({ ...formState, email: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-white/[0.06] border border-white/15 text-xs font-mono text-white placeholder-white/40 focus:outline-none focus:border-[var(--accent)]"
                />
                <textarea
                  placeholder="Your Message"
                  required
                  rows={3}
                  value={formState.message}
                  onChange={(e) => setFormState({ ...formState, message: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-white/[0.06] border border-white/15 text-xs font-mono text-white placeholder-white/40 focus:outline-none focus:border-[var(--accent)] resize-none"
                />
                <button
                  type="submit"
                  className="w-full py-2.5 rounded-lg bg-[var(--accent)] text-white text-xs font-mono font-bold uppercase flex items-center justify-center gap-2 hover:scale-[1.02] transition-transform"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>TRANSMIT MESSAGE</span>
                </button>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="pt-6 border-t border-white/10 flex items-center justify-between text-xs font-mono text-white/40">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-3.5 h-3.5 text-[var(--accent)]" />
          <span>EXHIBIT CONCLUSION</span>
        </div>
        <div>END OF ROOM EXHIBITION</div>
      </div>
    </div>
  );
}
