import { Metadata } from 'next';
import serverFirebaseHelpers from '@/app/lib/firebaseServer';
import ProofDetailClient from './ProofDetailClient';
import Link from 'next/link';
import type { ProofExperience, Project } from '@/app/lib/types';
import { SITE_NAME, getProofExperienceJsonLd } from '@/app/lib/seoSchemas';

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const proof = (await serverFirebaseHelpers.getProofExperienceById(id)) as ProofExperience | null;
  if (!proof) return { title: `Proof Experience Not Found | ${SITE_NAME}` };

  const title = `${proof.title} | Proof Mode | ${SITE_NAME}`;
  const description = proof.shortDescription || proof.problem;
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://rahulchakradhar.vercel.app';
  const canonicalUrl = `${baseUrl}/proof-mode/${proof.id}`;

  return {
    title,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      type: 'article',
      siteName: SITE_NAME,
      title,
      description,
      url: canonicalUrl,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  };
}

export default async function ProofDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const proof = (await serverFirebaseHelpers.getProofExperienceById(id)) as ProofExperience | null;

  if (!proof) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--background)] text-[var(--foreground)] p-6">
        <div className="text-center p-8 max-w-md paper-card border-2 border-[var(--foreground)] shadow-[6px_6px_0_0_rgba(42,36,31,0.15)]">
          <h1 className="text-2xl font-black mb-3 text-[var(--foreground)]">Proof Experience Not Found</h1>
          <p className="text-sm text-[var(--foreground)]/75 mb-6">
            The requested proof experience could not be found or may have been un-published.
          </p>
          <Link href="/proof-mode" className="paper-button px-5 py-2.5 text-xs font-extrabold uppercase inline-block">
            ← Return to Proof Mode
          </Link>
        </div>
      </div>
    );
  }

  let associatedProject: Project | null = null;
  if (proof.projectId) {
    associatedProject = (await serverFirebaseHelpers.getProjectById(proof.projectId)) as Project | null;
  }

  const jsonLd = getProofExperienceJsonLd(proof);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ProofDetailClient proofExperience={proof} associatedProject={associatedProject} />
    </>
  );
}
