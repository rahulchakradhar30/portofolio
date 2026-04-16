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
    <main className="section-surface min-h-screen px-4 pb-20 pt-28 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-7xl">
        <Link href="/" className="mb-8 inline-flex items-center gap-2 rounded-full border border-cyan-200 bg-white px-4 py-2 text-sm font-semibold text-cyan-700 hover:bg-cyan-50">
          <ArrowLeft className="h-4 w-4" />
          Back to Home
        </Link>

        <h1 className="mb-3 bg-gradient-to-r from-[#0d1b2d] to-[#0f766e] bg-clip-text text-4xl font-black text-transparent md:text-6xl">All Certifications</h1>
        <p className="mb-10 text-slate-600">Credentials and achievements with full details and evidence.</p>

        {loading ? (
          <div className="text-slate-500">Loading certifications...</div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {certifications.map((cert, index) => (
              <motion.article
                key={cert.id}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.06 }}
                className="overflow-hidden rounded-3xl border border-cyan-100 bg-white shadow-md"
              >
                <div className="relative h-52 bg-gradient-to-br from-cyan-100 to-emerald-100">
                  {cert.image ? <Image src={cert.image} alt={cert.title} fill className="object-cover" /> : null}
                </div>
                <div className="p-5">
                  <h2 className="text-lg font-bold text-slate-900">{cert.title}</h2>
                  <p className="mt-1 text-sm text-slate-600">{cert.issuer}</p>
                  <p className="mt-1 text-xs text-slate-500">Issued {cert.issuedDate ? new Date(cert.issuedDate).toLocaleDateString() : 'N/A'}</p>
                  <Link href={`/certifications/${cert.id}`} className="mt-4 inline-flex rounded-full border border-cyan-200 px-4 py-2 text-sm font-semibold text-cyan-700 hover:bg-cyan-50">
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
