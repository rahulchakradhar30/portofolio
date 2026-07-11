import type { Metadata } from 'next';
import serverFirebaseHelpers from '@/app/lib/firebaseServer';
import AllProjectsClient from './AllProjectsClient';
import type { Project } from '@/app/lib/types';

export const metadata: Metadata = {
  title: 'All Projects | Rahul Chakradhar Portfolio',
  description: 'Explore the complete portfolio of innovative projects by Rahul Chakradhar, spanning AI, technology, web development, content creation, and entrepreneurship.',
};

export default async function AllProjectsPage() {
  const projects = (await serverFirebaseHelpers.getAllProjects()) as Project[];

  return <AllProjectsClient initialProjects={projects} />;
}
