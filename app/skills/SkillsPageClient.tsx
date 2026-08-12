"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import type { Skill } from "@/app/lib/types";
import { BackButton } from "@/app/components/NavigationContext";
import SkillIcon from "@/app/components/SkillIcon";

interface SkillsPageClientProps {
  initialSkills: Skill[];
}

export default function SkillsPageClient({ initialSkills }: SkillsPageClientProps) {
  const [skills] = useState<Skill[]>(initialSkills);

  return (
    <main className="min-h-screen bg-[var(--background)] px-4 pb-20 pt-24 text-[var(--foreground)] sm:px-6 sm:pt-28 lg:px-10">
      <div className="mx-auto max-w-7xl">
        <BackButton fallback="/" className="paper-button mb-6 inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold sm:mb-8">
          <ArrowLeft className="h-4 w-4" />
          Back
        </BackButton>

        <h1 className="mb-3 text-4xl font-black text-[var(--foreground)] sm:text-5xl md:text-6xl">All Skills</h1>
        <p className="mb-10 max-w-2xl text-sm leading-relaxed text-[var(--foreground)]/80 sm:text-base">A complete list of technical and creative capabilities.</p>

        {skills.length === 0 ? (
          <div className="paper-card p-10 text-center text-[var(--foreground)]/70">
            No skills found.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 sm:gap-6">
            {skills.map((skill, index) => (
              <motion.div
                key={skill.id || index}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="paper-card p-5 sm:rounded-3xl sm:p-6"
              >
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--surface-strong)] text-[var(--foreground)] sm:h-14 sm:w-14">
                  <SkillIcon title={skill.title} icon={skill.icon} className="h-8 w-8 sm:h-9 sm:w-9" />
                </div>
                <h2 className="text-lg font-bold text-[var(--foreground)] sm:text-xl">{skill.title}</h2>
                <p className="mt-2 text-sm leading-relaxed text-[var(--foreground)]/80">{skill.description}</p>
                <div className="mt-4 h-2 rounded-full bg-[var(--surface-soft)] overflow-hidden border border-[var(--foreground)]/20">
                  <div className="h-2 rounded-full bg-[var(--accent)]" style={{ width: `${skill.proficiency || 80}%` }} />
                </div>
                <p className="mt-1 text-right text-xs text-[var(--accent)] font-semibold">{skill.proficiency || 80}%</p>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
