import type { Metadata } from 'next';
import HirePageClient from './HirePageClient';

export const metadata: Metadata = {
  title: 'Hire Rahul Chakradhar | AI, Web Dev & Content Strategy',
  description: 'Inquire to hire Rahul Chakradhar for software development, AI systems engineering, product design, creative direction, or consulting.',
};

export default function HirePage() {
  return <HirePageClient />;
}
