import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Rahul Chakradhar Portfolio',
    short_name: 'Rahul Portfolio',
    description: 'Premium portfolio for Rahul Chakradhar, focused on AI-powered systems, product thinking, storytelling, and high-trust digital experiences.',
    start_url: '/',
    display: 'standalone',
    background_color: '#fffaf3',
    theme_color: '#2f241b',
    icons: [
      {
        src: '/favicon.ico',
        sizes: 'any',
        type: 'image/x-icon',
      },
    ],
  };
}
