import type { Metadata } from 'next';
import serverFirebaseHelpers from '@/app/lib/firebaseServer';
import SkillsPageClient from './SkillsPageClient';
import type { Skill } from '@/app/lib/types';
import { SITE_URL, SITE_NAME, PRIMARY_NAME, getBreadcrumbListEntity } from '@/app/lib/seoSchemas';

export const metadata: Metadata = {
  title: `All Skills | ${SITE_NAME}`,
  description: `Explore the technical toolkit, software skills, AI engineering tools, and systems expertise of ${PRIMARY_NAME}.`,
  alternates: {
    canonical: `${SITE_URL}/skills`,
  },
  openGraph: {
    type: 'website',
    siteName: SITE_NAME,
    title: `All Skills | ${SITE_NAME}`,
    description: `Explore the technical toolkit and AI engineering capabilities of ${PRIMARY_NAME}.`,
    url: `${SITE_URL}/skills`,
  },
  twitter: {
    card: 'summary_large_image',
    title: `All Skills | ${SITE_NAME}`,
    description: `Explore the technical toolkit and AI engineering capabilities of ${PRIMARY_NAME}.`,
  },
};

export default async function SkillsPage() {
  const skills = (await serverFirebaseHelpers.getAllSkills()) as Skill[];

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'CollectionPage',
        '@id': `${SITE_URL}/skills/#collection`,
        'name': `All Skills | ${SITE_NAME}`,
        'description': `Directory of technical skills and capabilities of ${PRIMARY_NAME}.`,
        'url': `${SITE_URL}/skills`,
        'mainEntity': {
          '@type': 'ItemList',
          'itemListElement': skills.map((s, idx) => ({
            '@type': 'ListItem',
            'position': idx + 1,
            'name': s.title,
            'description': s.description,
          })),
        },
      },
      getBreadcrumbListEntity([
        { name: 'Home', item: '/' },
        { name: 'Skills', item: '/skills' },
      ]),
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <SkillsPageClient initialSkills={skills} />
    </>
  );
}
