import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Rahul Chakradhar Portfolio',
    short_name: 'Rahul Portfolio',
    description: 'Official portfolio of Rahul Chakradhar Perepogu - AI Engineer, Full Stack Developer, and Student Researcher.',
    start_url: '/',
    display: 'standalone',
    orientation: 'portrait',
    background_color: '#fffaf3',
    theme_color: '#2f241b',
    icons: [
      {
        src: '/favicon.ico',
        sizes: 'any',
        type: 'image/x-icon',
      },
      {
        src: '/icon.svg',
        sizes: '512x512 192x192 96x96 48x48',
        type: 'image/svg+xml',
        purpose: 'maskable',
      },
    ],
  };
}
