import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Rahul Chakradhar Portfolio',
    short_name: 'Rahul Portfolio',
    description: 'Portfolio of Rahul Chakradhar — AI/ML student, Full Stack Developer, and Creative Technologist building AI-powered digital products, web experiences, and innovative technology projects.',
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
