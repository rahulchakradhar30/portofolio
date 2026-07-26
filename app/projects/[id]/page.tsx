import { Metadata } from 'next';
import serverFirebaseHelpers from '@/app/lib/firebaseServer';
import ProjectDetailClient from './ProjectDetailClient';
import Link from 'next/link';
import type { Project } from '@/app/lib/types';
import { SITE_URL, SITE_NAME, PRIMARY_NAME, getProjectJsonLd } from '@/app/lib/seoSchemas';

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const project = (await serverFirebaseHelpers.getProjectById(id)) as Project | null;
  if (!project) return { title: `Project Not Found | ${SITE_NAME}` };

  const title = `${project.title} | ${SITE_NAME}`;
  const description = project.description || `Read about ${project.title} developed by ${PRIMARY_NAME}.`;
  const canonicalUrl = `${SITE_URL}/projects/${project.id}`;
  const ogImage = project.image || `${SITE_URL}/icon.svg`;

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
          alt: project.title,
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

export default async function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const project = (await serverFirebaseHelpers.getProjectById(id)) as Project | null;

  if (!project) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">Project Not Found</h1>
          <Link href="/projects" className="font-semibold text-[#8d6b4e] hover:text-[#7a5f47]">
            ← Back to Projects
          </Link>
        </div>
      </div>
    );
  }

  const jsonLd = getProjectJsonLd(project);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ProjectDetailClient project={project} />
    </>
  );
}
