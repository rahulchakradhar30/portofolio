import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const envUrl = process.env.NEXT_PUBLIC_SITE_URL;
  const baseUrl = (envUrl && !envUrl.includes('portofolio-one-dun-27') && !envUrl.includes('rahulchakradhar.com') && !envUrl.includes('localhost'))
    ? envUrl.replace(/\/$/, '')
    : 'https://rahulchakradhar.vercel.app';
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin/', '/api/'],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
