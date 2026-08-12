"use client";

import { useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowLeft, ExternalLink } from "lucide-react";
import type { Certification } from "@/app/lib/types";
import ImageLightbox from "@/app/components/ImageLightbox";
import { getYouTubeId } from "@/app/lib/youtube";
import { BackButton } from "@/app/components/NavigationContext";

interface CertificationDetailClientProps {
  certification: Certification;
}

export default function CertificationDetailClient({ certification }: CertificationDetailClientProps) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxImages, setLightboxImages] = useState<string[]>([]);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  const openLightbox = (images: string[], index: number) => {
    setLightboxImages(images.filter(Boolean));
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  const youtubeIds = (certification.youtubeLinks || []).map((url) => getYouTubeId(url)).filter((id): id is string => Boolean(id));

  return (
    <main className="min-h-screen bg-[var(--background)] px-4 pb-20 pt-24 text-[var(--foreground)] sm:px-6 lg:px-10">
      <div className="mx-auto max-w-[1600px]">
        <BackButton fallback="/certifications" className="paper-button mb-6 inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold sm:mb-8">
          <ArrowLeft className="h-4 w-4" />
          Back
        </BackButton>

        <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="paper-card p-5 sm:p-6 md:p-8">
          <h1 className="text-3xl font-black leading-tight text-[var(--foreground)] sm:text-4xl md:text-5xl">{certification.title}</h1>
          <p className="mt-2 text-[var(--accent)] font-medium">{certification.issuer}</p>
          <p className="mt-1 text-sm text-[var(--foreground)]/70">Issued {certification.issuedDate ? new Date(certification.issuedDate).toLocaleDateString() : 'N/A'}</p>

          {certification.image && (
            <button
              type="button"
              onClick={() => openLightbox([certification.image || ""], 0)}
              className="relative mt-6 h-56 w-full overflow-hidden rounded-2xl border border-[var(--foreground)]/20 sm:h-72"
              title="Click to view full image"
            >
              <Image src={certification.image} alt={certification.title} fill className="object-cover" />
            </button>
          )}

          {certification.description && <p className="mt-6 text-sm leading-relaxed text-[var(--foreground)]/80 sm:text-base">{certification.description}</p>}

          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            {certification.credentialUrl && (
              <a href={certification.credentialUrl} target="_blank" rel="noopener noreferrer" className="paper-button-primary inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold">
                <ExternalLink className="h-4 w-4" />
                View Credential
              </a>
            )}
            {certification.linkedinUrl && (
              <a href={certification.linkedinUrl} target="_blank" rel="noopener noreferrer" className="paper-button inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold">
                <ExternalLink className="h-4 w-4" />
                View LinkedIn
              </a>
            )}
          </div>
        </motion.section>

        {certification.galleryImages && certification.galleryImages.length > 0 && (
          <section className="mt-10 paper-card p-5 sm:p-6 md:p-8">
            <h2 className="mb-5 text-xl font-bold text-[var(--foreground)] sm:mb-6 sm:text-2xl">Gallery</h2>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 sm:gap-4">
              {certification.galleryImages.map((image, idx) => (
                <button
                  key={`${image}-${idx}`}
                  type="button"
                  onClick={() => openLightbox(certification.galleryImages || [], idx)}
                  className="relative h-40 overflow-hidden rounded-2xl border border-[var(--foreground)]/20 sm:h-48"
                  title="Click to open and zoom"
                >
                  <Image src={image} alt={`Gallery ${idx + 1}`} fill className="object-cover" />
                </button>
              ))}
            </div>
          </section>
        )}

        {youtubeIds.length > 0 && (
          <section className="mt-10 paper-card p-5 sm:p-6 md:p-8">
            <h2 className="mb-5 text-xl font-bold text-[var(--foreground)] sm:mb-6 sm:text-2xl">Videos</h2>
            <div className="grid gap-4 md:grid-cols-2 sm:gap-6">
              {youtubeIds.map((id, idx) => (
                <div key={`${id}-${idx}`} className="aspect-video overflow-hidden rounded-2xl border border-[var(--foreground)]/20 bg-[var(--surface-soft)]">
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
