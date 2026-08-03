import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Tasken — личные задачи',
    short_name: 'Tasken',
    description:
      'Безопасное управление личными задачами с поддержкой Markdown.',
    start_url: '/',
    display: 'standalone',
    background_color: '#fafafa',
    theme_color: '#18181b',
    lang: 'ru',
    icons: [
      {
        src: '/icon',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  };
}
