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
    ],
  };
}
