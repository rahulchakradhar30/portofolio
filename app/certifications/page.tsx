import type { Metadata } from 'next';
import serverFirebaseHelpers from '@/app/lib/firebaseServer';
import CertificationsPageClient from './CertificationsPageClient';
import type { Certification } from '@/app/lib/types';

export const metadata: Metadata = {
  title: 'All Certifications | Rahul Chakradhar Portfolio',
  description: 'Explore the complete directory of professional credentials, certifications, achievements, and technical milestones earned by Rahul Chakradhar.',
};

export default async function CertificationsPage() {
  const certifications = (await serverFirebaseHelpers.getAllCertifications()) as Certification[];

  return <CertificationsPageClient initialCertifications={certifications} />;
}
