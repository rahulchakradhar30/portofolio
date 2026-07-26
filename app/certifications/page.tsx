import type { Metadata } from 'next';
import serverFirebaseHelpers from '@/app/lib/firebaseServer';
import CertificationsPageClient from './CertificationsPageClient';
import type { Certification } from '@/app/lib/types';
import { SITE_URL, SITE_NAME, PRIMARY_NAME, getBreadcrumbListEntity } from '@/app/lib/seoSchemas';

export const metadata: Metadata = {
  title: `All Certifications | ${SITE_NAME}`,
  description: `Explore the complete directory of professional credentials, certifications, achievements, and technical milestones earned by ${PRIMARY_NAME} (P Rahul Chakradhar).`,
  alternates: {
    canonical: `${SITE_URL}/certifications`,
  },
  openGraph: {
    type: 'website',
    siteName: SITE_NAME,
    title: `All Certifications | ${SITE_NAME}`,
    description: `Directory of verified credentials and certifications earned by ${PRIMARY_NAME}.`,
    url: `${SITE_URL}/certifications`,
  },
  twitter: {
    card: 'summary_large_image',
    title: `All Certifications | ${SITE_NAME}`,
    description: `Directory of verified credentials and certifications earned by ${PRIMARY_NAME}.`,
  },
};

export default async function CertificationsPage() {
  const certifications = (await serverFirebaseHelpers.getAllCertifications()) as Certification[];

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'CollectionPage',
        '@id': `${SITE_URL}/certifications/#collection`,
        'name': `All Certifications | ${SITE_NAME}`,
        'description': `Verified certifications and credentials earned by ${PRIMARY_NAME}.`,
        'url': `${SITE_URL}/certifications`,
        'mainEntity': {
          '@type': 'ItemList',
          'itemListElement': certifications.map((c, idx) => ({
            '@type': 'ListItem',
            'position': idx + 1,
            'url': `${SITE_URL}/certifications/${c.id}`,
            'name': c.title,
          })),
        },
      },
      getBreadcrumbListEntity([
        { name: 'Home', item: '/' },
        { name: 'Certifications', item: '/certifications' },
      ]),
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <CertificationsPageClient initialCertifications={certifications} />
    </>
  );
}
