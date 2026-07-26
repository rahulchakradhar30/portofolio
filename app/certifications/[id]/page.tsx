import { Metadata } from 'next';
import serverFirebaseHelpers from '@/app/lib/firebaseServer';
import CertificationDetailClient from './CertificationDetailClient';
import Link from 'next/link';
import type { Certification } from '@/app/lib/types';
import { SITE_URL, SITE_NAME, PRIMARY_NAME, getCertificationJsonLd } from '@/app/lib/seoSchemas';

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const certification = (await serverFirebaseHelpers.getCertificationById(id)) as Certification | null;
  if (!certification) return { title: `Certification Not Found | ${SITE_NAME}` };

  const title = `${certification.title} | ${SITE_NAME}`;
  const description = certification.description || `View certification: ${certification.title} issued by ${certification.issuer} to ${PRIMARY_NAME}.`;
  const canonicalUrl = `${SITE_URL}/certifications/${certification.id}`;
  const ogImage = certification.image || `${SITE_URL}/icon.svg`;

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
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: certification.title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImage],
      site: '@rahulchakradhar',
      creator: '@rahulchakradhar',
    },
  };
}

export default async function CertificationDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const certification = (await serverFirebaseHelpers.getCertificationById(id)) as Certification | null;

  if (!certification) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">Certification Not Found</h1>
          <Link href="/certifications" className="font-semibold text-[#8d6b4e] hover:text-[#7a5f47]">
            ← Back to Certifications
          </Link>
        </div>
      </div>
    );
  }

  const jsonLd = getCertificationJsonLd(certification);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <CertificationDetailClient certification={certification} />
    </>
  );
}
