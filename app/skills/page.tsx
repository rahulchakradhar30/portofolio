import type { Metadata } from 'next';
import serverFirebaseHelpers from '@/app/lib/firebaseServer';
import SkillsPageClient from './SkillsPageClient';
import type { Skill } from '@/app/lib/types';

export const metadata: Metadata = {
  title: 'All Skills | Rahul Chakradhar Portfolio',
  description: 'Explore the technical expertise, tools, systems, and creative skills of Rahul Chakradhar, with focus on AI Systems, software development, and storytelling.',
};

export default async function SkillsPage() {
  const skills = (await serverFirebaseHelpers.getAllSkills()) as Skill[];

  return <SkillsPageClient initialSkills={skills} />;
}
