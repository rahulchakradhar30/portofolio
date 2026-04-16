"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { useParams } from "next/navigation";
import type { Certification } from "@/app/lib/types";

function getYouTubeId(url: string) {
  const regex = /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/;
  const match = url.match(regex);
  return match ? match[1] : null;
}

export default function CertificationDetailPage() {
  const params = useParams();
  const certId = params.id as string;
  const [certification, setCertification] = useState<Certification | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`/api/admin/certifications/${certId}`);
        const data = await res.json();
        if (res.ok) setCertification(data.certification);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [certId]);

  if (loading) return <div className="min-h-screen flex items-center justify-center text-slate-500">Loading certification...</div>;
  if (!certification) return <div className="min-h-screen flex items-center justify-center text-slate-500">Certification not found.</div>;

  const youtubeIds = (certification.youtubeLinks || []).map((url) => getYouTubeId(url)).filter((id): id is string => Boolean(id));

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 px-4 pb-20 pt-24 text-white sm:px-6 lg:px-10">
      <div className="mx-auto max-w-6xl">
        <Link href="/certifications" className="mb-8 inline-flex items-center gap-2 text-cyan-300 hover:text-cyan-200">
          <ArrowLeft className="h-4 w-4" />
          Back to Certifications
        </Link>

        <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="rounded-3xl border border-slate-700/60 bg-slate-800/60 p-6 shadow-2xl md:p-8">
          <h1 className="text-3xl font-black md:text-5xl">{certification.title}</h1>
          <p className="mt-2 text-slate-300">{certification.issuer}</p>
          <p className="mt-1 text-sm text-slate-400">Issued {certification.issuedDate ? new Date(certification.issuedDate).toLocaleDateString() : 'N/A'}</p>

          {certification.image && (
            <div className="relative mt-6 h-72 overflow-hidden rounded-2xl border border-slate-700/60">
              <Image src={certification.image} alt={certification.title} fill className="object-cover" />
            </div>
          )}

          {certification.description && <p className="mt-6 leading-relaxed text-slate-200">{certification.description}</p>}

          <div className="mt-6 flex flex-wrap gap-3">
            {certification.credentialUrl && (
              <a href={certification.credentialUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-full bg-cyan-600 px-4 py-2 text-sm font-semibold text-white">
                <ExternalLink className="h-4 w-4" />
                View Credential
              </a>
            )}
            {certification.linkedinUrl && (
              <a href={certification.linkedinUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-full border border-cyan-300 px-4 py-2 text-sm font-semibold text-cyan-200">
                <ExternalLink className="h-4 w-4" />
                View LinkedIn
              </a>
            )}
          </div>
        </motion.section>

        {certification.galleryImages && certification.galleryImages.length > 0 && (
          <section className="mt-10 rounded-3xl border border-slate-700/60 bg-slate-800/60 p-6 md:p-8">
            <h2 className="text-2xl font-bold mb-6">Gallery</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {certification.galleryImages.map((image, idx) => (
                <div key={`${image}-${idx}`} className="relative h-48 overflow-hidden rounded-2xl border border-slate-700/60">
                  <Image src={image} alt={`Gallery ${idx + 1}`} fill className="object-cover" />
                </div>
              ))}
            </div>
          </section>
        )}

        {youtubeIds.length > 0 && (
          <section className="mt-10 rounded-3xl border border-slate-700/60 bg-slate-800/60 p-6 md:p-8">
            <h2 className="text-2xl font-bold mb-6">Videos</h2>
            <div className="grid gap-6 md:grid-cols-2">
              {youtubeIds.map((id, idx) => (
                <div key={`${id}-${idx}`} className="aspect-video overflow-hidden rounded-2xl border border-slate-700/60">
                  <iframe
                    className="w-full h-full"
                    src={`https://www.youtube.com/embed/${id}`}
                    title={`Certification video ${idx + 1}`}
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
