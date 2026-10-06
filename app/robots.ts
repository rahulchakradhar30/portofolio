import { MetadataRoute } from 'next';
import { SITE_URL } from '@/app/lib/seoSchemas';

export default function robots(): MetadataRoute.Robots {
  const envUrl = process.env.NEXT_PUBLIC_SITE_URL || SITE_URL;
  const baseUrl = (envUrl && !envUrl.includes('portofolio-one-dun-27') && !envUrl.includes('rahulchakradhar.com') && !envUrl.includes('localhost'))
    ? envUrl.replace(/\/$/, '')
    : SITE_URL;
  return {
    rules: {
      userAgent: '*',
      allow: ['/', '/api/favicon', '/favicon.ico'],
      disallow: ['/admin/', '/api/admin/'],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
