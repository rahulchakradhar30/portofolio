import { MetadataRoute } from 'next';
import serverFirebaseHelpers from '@/app/lib/firebaseServer';
import type { Project, Certification } from '@/app/lib/types';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://rahulchakradhar.com';

  // Base routes
  const routes = [
    '',
    '/projects',
    '/skills',
    '/certifications',
    '/hire',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: route === '' ? 1.0 : 0.8,
  }));

  try {
    // Dynamic project routes
    const projects = (await serverFirebaseHelpers.getAllProjects()) as Project[];
    const projectRoutes = projects.map((project) => ({
      url: `${baseUrl}/projects/${project.id}`,
      lastModified: new Date(project.updated_at || project.created_at || new Date()),
      changeFrequency: 'weekly' as const,
      priority: 0.6,
    }));

    // Dynamic certification routes
    const certifications = (await serverFirebaseHelpers.getAllCertifications()) as Certification[];
    const certificationRoutes = certifications.map((cert) => ({
      url: `${baseUrl}/certifications/${cert.id}`,
      lastModified: new Date(cert.updated_at || cert.created_at || new Date()),
      changeFrequency: 'monthly' as const,
      priority: 0.5,
    }));

    return [...routes, ...projectRoutes, ...certificationRoutes];
  } catch (error) {
    console.error('Error generating dynamic sitemap routes:', error);
    return routes;
  }
}
