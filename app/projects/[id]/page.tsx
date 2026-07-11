import { Metadata } from 'next';
import serverFirebaseHelpers from '@/app/lib/firebaseServer';
import ProjectDetailClient from './ProjectDetailClient';
import Link from 'next/link';
import type { Project } from '@/app/lib/types';

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const project = (await serverFirebaseHelpers.getProjectById(id)) as Project | null;
  if (!project) return { title: 'Project Not Found | Rahul Chakradhar' };

  return {
    title: `${project.title} | Rahul Chakradhar Projects`,
    description: project.description || `Read about ${project.title} by Rahul Chakradhar.`,
    openGraph: {
      title: project.title,
      description: project.description,
      images: project.image ? [{ url: project.image }] : [],
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
          <Link href="/" className="font-semibold text-[#8d6b4e] hover:text-[#7a5f47]">
            ← Back to Home
          </Link>
        </div>
      </div>
    );
  }

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CreativeWork',
    'name': project.title,
    'description': project.description,
    'image': project.image,
    'url': `https://rahulchakradhar.com/projects/${project.id}`,
    'creator': {
      '@type': 'Person',
      'name': 'Rahul Chakradhar',
    },
  };

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
