import { Metadata } from 'next';
import serverFirebaseHelpers from '@/app/lib/firebaseServer';
import CertificationDetailClient from './CertificationDetailClient';
import Link from 'next/link';
import type { Certification } from '@/app/lib/types';

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const certification = (await serverFirebaseHelpers.getCertificationById(id)) as Certification | null;
  if (!certification) return { title: 'Certification Not Found | Rahul Chakradhar' };

  return {
    title: `${certification.title} | Rahul Chakradhar Certifications`,
    description: certification.description || `View certification: ${certification.title} issued by ${certification.issuer}.`,
    openGraph: {
      title: certification.title,
      description: certification.description,
      images: certification.image ? [{ url: certification.image }] : [],
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

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'EducationalOccupationalCredential',
    'name': certification.title,
    'description': certification.description,
    'image': certification.image,
    'credentialCategory': 'Certification',
    'url': `https://rahulchakradhar.com/certifications/${certification.id}`,
    'recognizedBy': {
      '@type': 'Organization',
      'name': certification.issuer,
    },
  };

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
