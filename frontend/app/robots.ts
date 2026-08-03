import type { MetadataRoute } from 'next';

import { getSiteUrl } from '@/app/lib/site';

export default function robots(): MetadataRoute.Robots {
  const siteUrl = getSiteUrl();

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/api/',
        '/sanctum/',
        '/dashboard',
        '/todos',
        '/login',
        '/signup',
      ],
    },
    sitemap: new URL('/sitemap.xml', siteUrl).toString(),
    host: siteUrl.origin,
  };
}
