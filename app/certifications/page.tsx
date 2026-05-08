"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import type { Certification } from "@/app/lib/types";

export default function CertificationsPage() {
  const [certifications, setCertifications] = useState<Certification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCerts = async () => {
      try {
        const res = await fetch('/api/admin/certifications');
        const data = await res.json();
        if (res.ok) {
          setCertifications(data.certifications || []);
        }
      } finally {
        setLoading(false);
      }
    };

    loadCerts();
  }, []);

  return (
    <main className="section-surface min-h-screen px-4 pb-20 pt-24 sm:px-6 sm:pt-28 lg:px-10">
      <div className="mx-auto max-w-[1600px]">
        <Link href="/" className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#7a5f47]/12 bg-white px-4 py-2 text-sm font-semibold text-[#5f4a38] hover:bg-[#f7efe4] sm:mb-8">
          <ArrowLeft className="h-4 w-4" />
          Back to Home
        </Link>

        <h1 className="mb-3 bg-gradient-to-r from-[#7a5f47] via-[#b6926d] to-[#9b7a5b] bg-clip-text text-4xl font-black text-transparent sm:text-5xl md:text-6xl">All Certifications</h1>
        <p className="mb-10 max-w-2xl text-sm leading-relaxed text-[#6a5846] sm:text-base">Credentials and achievements with full details and evidence.</p>

        {loading ? (
          <div className="text-[#7a5f47]">Loading certifications...</div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 sm:gap-8">
            {certifications.map((cert, index) => (
              <motion.article
                key={cert.id}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.06 }}
                className="overflow-hidden rounded-2xl border border-[#7a5f47]/12 bg-white shadow-md sm:rounded-3xl"
              >
                <div className="relative h-44 bg-gradient-to-br from-[#f7efe4] to-[#eadbbf] sm:h-52">
                  {cert.image ? <Image src={cert.image} alt={cert.title} fill className="object-cover" /> : null}
                </div>
                <div className="p-5 sm:p-5">
                  <h2 className="text-base font-bold text-[#2f241b] sm:text-lg">{cert.title}</h2>
                  <p className="mt-1 text-sm text-[#6a5846]">{cert.issuer}</p>
                  <p className="mt-1 text-xs text-[#8d6b4e]">Issued {cert.issuedDate ? new Date(cert.issuedDate).toLocaleDateString() : 'N/A'}</p>
                  <Link href={`/certifications/${cert.id}`} className="mt-4 inline-flex rounded-full border border-[#7a5f47]/12 px-4 py-2 text-sm font-semibold text-[#5f4a38] hover:bg-[#f7efe4]">
                    View Details
                  </Link>
                </div>
              </motion.article>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
