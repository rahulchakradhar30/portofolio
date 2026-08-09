import type { Metadata } from 'next';
import HirePageClient from './HirePageClient';
import { SITE_URL, SITE_NAME, PRIMARY_NAME, getBreadcrumbListEntity } from '@/app/lib/seoSchemas';

export const metadata: Metadata = {
  title: `Hire ${PRIMARY_NAME} | AI Systems & Web Development`,
  description: `Inquire to hire ${PRIMARY_NAME} for AI systems engineering, full-stack software development, technical consulting, or custom product design.`,
  alternates: {
    canonical: `${SITE_URL}/hire`,
  },
  openGraph: {
    type: 'website',
    siteName: SITE_NAME,
    title: `Hire ${PRIMARY_NAME} | AI Systems & Web Development`,
    description: `Inquire to hire ${PRIMARY_NAME} for software engineering, AI systems, and product development.`,
    url: `${SITE_URL}/hire`,
  },
  twitter: {
    card: 'summary_large_image',
    title: `Hire ${PRIMARY_NAME} | AI Systems & Web Development`,
    description: `Inquire to hire ${PRIMARY_NAME} for software engineering and AI systems development.`,
  },
};

export default function HirePage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'ContactPage',
        '@id': `${SITE_URL}/hire/#contactpage`,
        'name': `Hire ${PRIMARY_NAME} | ${SITE_NAME}`,
        'description': `Talent engagement and proposal submission portal for ${PRIMARY_NAME}.`,
        'url': `${SITE_URL}/hire`,
        'mainEntity': { '@id': `${SITE_URL}/#person` },
      },
      getBreadcrumbListEntity([
        { name: 'Home', item: '/' },
        { name: 'Hire', item: '/hire' },
      ]),
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <HirePageClient />
    </>
  );
}
