import type { Metadata } from 'next';
import serverFirebaseHelpers from '@/app/lib/firebaseServer';
import AllProjectsClient from './AllProjectsClient';
import type { Project } from '@/app/lib/types';
import { SITE_URL, SITE_NAME, PRIMARY_NAME, getBreadcrumbListEntity } from '@/app/lib/seoSchemas';

export const metadata: Metadata = {
  title: `All Projects | ${SITE_NAME}`,
  description: `Explore the complete portfolio of software engineering, AI systems, and web projects developed by ${PRIMARY_NAME} (P Rahul Chakradhar).`,
  alternates: {
    canonical: `${SITE_URL}/projects`,
  },
  openGraph: {
    type: 'website',
    siteName: SITE_NAME,
    title: `All Projects | ${SITE_NAME}`,
    description: `Explore the complete portfolio of AI and software engineering projects by ${PRIMARY_NAME}.`,
    url: `${SITE_URL}/projects`,
  },
  twitter: {
    card: 'summary_large_image',
    title: `All Projects | ${SITE_NAME}`,
    description: `Explore the complete portfolio of software engineering projects by ${PRIMARY_NAME}.`,
  },
};

export default async function AllProjectsPage() {
  const projects = (await serverFirebaseHelpers.getAllProjects()) as Project[];

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'CollectionPage',
        '@id': `${SITE_URL}/projects/#collection`,
        'name': `All Projects | ${SITE_NAME}`,
        'description': `Complete directory of projects by ${PRIMARY_NAME}.`,
        'url': `${SITE_URL}/projects`,
        'mainEntity': {
          '@type': 'ItemList',
          'itemListElement': projects.map((p, idx) => ({
            '@type': 'ListItem',
            'position': idx + 1,
            'url': `${SITE_URL}/projects/${p.id}`,
            'name': p.title,
          })),
        },
      },
      getBreadcrumbListEntity([
        { name: 'Home', item: '/' },
        { name: 'Projects', item: '/projects' },
      ]),
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <AllProjectsClient initialProjects={projects} />
    </>
  );
}
