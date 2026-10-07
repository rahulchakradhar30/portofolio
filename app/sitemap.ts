import { MetadataRoute } from 'next';
import serverFirebaseHelpers from '@/app/lib/firebaseServer';
import type { Project, Certification, PortfolioContent, ProofExperience } from '@/app/lib/types';
import { SITE_URL, sanitizeSiteUrl } from '@/app/lib/seoSchemas';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const content = (await serverFirebaseHelpers.getPortfolioContent()) as PortfolioContent | null;
  const baseUrl = sanitizeSiteUrl(content?.seoCanonicalUrl || process.env.NEXT_PUBLIC_SITE_URL || SITE_URL);

  // Base public routes (Excludes /admin and /api)
  const routes: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/projects`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/skills`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/certifications`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/hire`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/proof-mode`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/sitemap`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.5,
    },
  ];

  try {
    // Dynamic project routes
    const projects = ((await serverFirebaseHelpers.getAllProjects()) as Project[]) || [];
    const projectRoutes: MetadataRoute.Sitemap = projects
      .filter((project) => Boolean(project && project.id))
      .map((project) => ({
        url: `${baseUrl}/projects/${encodeURIComponent(project.id)}`,
        lastModified: new Date(project.updated_at || project.created_at || new Date()),
        changeFrequency: 'weekly',
        priority: 0.7,
      }));

    // Dynamic certification routes
    const certifications = ((await serverFirebaseHelpers.getAllCertifications()) as Certification[]) || [];
    const certificationRoutes: MetadataRoute.Sitemap = certifications
      .filter((cert) => Boolean(cert && cert.id))
      .map((cert) => ({
        url: `${baseUrl}/certifications/${encodeURIComponent(cert.id)}`,
        lastModified: new Date(cert.updated_at || cert.created_at || new Date()),
        changeFrequency: 'monthly',
        priority: 0.6,
      }));

    // Dynamic proof-mode routes
    const proofExperiences = ((await serverFirebaseHelpers.getAllProofExperiences()) as ProofExperience[]) || [];
    const proofRoutes: MetadataRoute.Sitemap = proofExperiences
      .filter((proof) => Boolean(proof && proof.id))
      .map((proof) => ({
        url: `${baseUrl}/proof-mode/${encodeURIComponent(proof.id)}`,
        lastModified: new Date(proof.updated_at || proof.created_at || new Date()),
        changeFrequency: 'weekly',
        priority: 0.7,
      }));

    return [...routes, ...projectRoutes, ...certificationRoutes, ...proofRoutes];
  } catch (error) {
    console.error('Error generating dynamic sitemap routes:', error);
    return routes;
  }
}
