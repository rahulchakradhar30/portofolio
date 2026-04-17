"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { useParams } from "next/navigation";
import type { Certification } from "@/app/lib/types";
import ImageLightbox from "@/app/components/ImageLightbox";
import { getYouTubeId } from "@/app/lib/youtube";

export default function CertificationDetailPage() {
  const params = useParams();
  const certId = params.id as string;
  const [certification, setCertification] = useState<Certification | null>(null);
  const [loading, setLoading] = useState(true);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxImages, setLightboxImages] = useState<string[]>([]);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  const openLightbox = (images: string[], index: number) => {
    setLightboxImages(images.filter(Boolean));
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

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
      <div className="mx-auto max-w-[1600px]">
        <Link href="/certifications" className="mb-6 inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-white/5 px-3 py-2 text-sm text-cyan-300 hover:text-cyan-200 sm:mb-8">
          <ArrowLeft className="h-4 w-4" />
          Back to Certifications
        </Link>

        <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="rounded-3xl border border-slate-700/60 bg-slate-800/60 p-5 shadow-2xl sm:p-6 md:p-8">
          <h1 className="text-3xl font-black leading-tight sm:text-4xl md:text-5xl">{certification.title}</h1>
          <p className="mt-2 text-slate-300">{certification.issuer}</p>
          <p className="mt-1 text-sm text-slate-400">Issued {certification.issuedDate ? new Date(certification.issuedDate).toLocaleDateString() : 'N/A'}</p>

          {certification.image && (
            <button
              type="button"
              onClick={() => openLightbox([certification.image || ""], 0)}
              className="relative mt-6 h-56 w-full overflow-hidden rounded-2xl border border-slate-700/60 sm:h-72"
              title="Click to view full image"
            >
              <Image src={certification.image} alt={certification.title} fill className="object-cover" />
            </button>
          )}

          {certification.description && <p className="mt-6 text-sm leading-relaxed text-slate-200 sm:text-base">{certification.description}</p>}

          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            {certification.credentialUrl && (
              <a href={certification.credentialUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center gap-2 rounded-full bg-cyan-600 px-4 py-2 text-sm font-semibold text-white">
                <ExternalLink className="h-4 w-4" />
                View Credential
              </a>
            )}
            {certification.linkedinUrl && (
              <a href={certification.linkedinUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center gap-2 rounded-full border border-cyan-300 px-4 py-2 text-sm font-semibold text-cyan-200">
                <ExternalLink className="h-4 w-4" />
                View LinkedIn
              </a>
            )}
          </div>
        </motion.section>

        {certification.galleryImages && certification.galleryImages.length > 0 && (
          <section className="mt-10 rounded-3xl border border-slate-700/60 bg-slate-800/60 p-5 sm:p-6 md:p-8">
            <h2 className="mb-5 text-xl font-bold sm:mb-6 sm:text-2xl">Gallery</h2>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 sm:gap-4">
              {certification.galleryImages.map((image, idx) => (
                <button
                  key={`${image}-${idx}`}
                  type="button"
                  onClick={() => openLightbox(certification.galleryImages || [], idx)}
                  className="relative h-40 overflow-hidden rounded-2xl border border-slate-700/60 sm:h-48"
                  title="Click to open and zoom"
                >
                  <Image src={image} alt={`Gallery ${idx + 1}`} fill className="object-cover" />
                </button>
              ))}
            </div>
          </section>
        )}

        {youtubeIds.length > 0 && (
          <section className="mt-10 rounded-3xl border border-slate-700/60 bg-slate-800/60 p-5 sm:p-6 md:p-8">
            <h2 className="mb-5 text-xl font-bold sm:mb-6 sm:text-2xl">Videos</h2>
            <div className="grid gap-4 md:grid-cols-2 sm:gap-6">
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

        {lightboxOpen ? (
          <ImageLightbox
            images={lightboxImages}
            open={lightboxOpen}
            initialIndex={lightboxIndex}
            onClose={() => setLightboxOpen(false)}
          />
        ) : null}
      </div>
    </main>
  );
}
