"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowLeft, Award } from "lucide-react";
import type { Certification } from "@/app/lib/types";
import { BackButton } from "@/app/components/NavigationContext";

interface CertificationsPageClientProps {
  initialCertifications: Certification[];
}

export default function CertificationsPageClient({ initialCertifications }: CertificationsPageClientProps) {
  const [certifications] = useState<Certification[]>(initialCertifications);

  return (
    <main className="min-h-screen bg-[var(--background)] px-4 pb-20 pt-24 sm:px-6 sm:pt-28 lg:px-10">
      <div className="mx-auto max-w-[1600px]">
        <BackButton fallback="/" className="paper-button mb-6 inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold sm:mb-8 hover:text-[var(--accent)] transition">
          <ArrowLeft className="h-4 w-4" />
          Back
        </BackButton>

        <h1 className="mb-3 text-4xl font-black text-[var(--foreground)] sm:text-5xl md:text-6xl tracking-tighter">All Certifications</h1>
        <p className="mb-10 max-w-2xl text-sm leading-relaxed text-[var(--foreground)] sm:text-base font-medium">Credentials and achievements with full details and evidence.</p>

        {certifications.length === 0 ? (
          <div className="paper-card p-10 text-center font-bold text-lg">
            No certifications found.
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 sm:gap-8">
            {certifications.map((cert, index) => (
              <motion.article
                key={cert.id}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.06 }}
                className="paper-card group overflow-hidden flex flex-col"
              >
                <div className="relative h-44 bg-[var(--surface-soft)] sm:h-52 border-b-2 border-[var(--foreground)]">
                  {cert.image ? (
                    <Image src={cert.image} alt={cert.title} fill className="object-cover transition-transform duration-500 group-hover:scale-105" />
                  ) : (
                    <div className="flex h-full items-center justify-center bg-[var(--surface-strong)]">
                      <Award className="h-12 w-12 text-[var(--foreground)] transition-transform duration-300 group-hover:scale-110 opacity-20" />
                    </div>
                  )}
                </div>
                <div className="p-5 flex flex-col flex-1 sm:p-6 space-y-4">
                  <div>
                    <h2 className="text-xl font-black tracking-tight text-[var(--foreground)] transition-colors group-hover:text-[var(--accent)]">{cert.title}</h2>
                    <p className="mt-2 text-sm font-bold text-[var(--foreground)] uppercase tracking-widest">Issuer: {cert.issuer}</p>
                    <p className="mt-1 text-xs font-bold uppercase tracking-widest text-[var(--accent)]">Issued {cert.issuedDate ? new Date(cert.issuedDate).toLocaleDateString() : 'N/A'}</p>
                  </div>
                  <div className="mt-auto pt-2">
                    <Link href={`/certifications/${cert.id}`} className="paper-button-primary inline-flex px-5 py-2.5 text-sm">
                      View Details
                    </Link>
                  </div>
                </div>
              </motion.article>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
