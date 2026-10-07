import { MetadataRoute } from 'next';
import { SITE_URL, sanitizeSiteUrl } from '@/app/lib/seoSchemas';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = sanitizeSiteUrl(process.env.NEXT_PUBLIC_SITE_URL || SITE_URL);
  return {
    rules: {
      userAgent: '*',
      allow: ['/', '/api/favicon', '/favicon.ico'],
      disallow: ['/admin/', '/api/admin/'],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
