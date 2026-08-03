import type { MetadataRoute } from 'next';

import { getSiteUrl } from '@/app/lib/site';

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: new URL('/', getSiteUrl()).toString(),
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    },
  ];
}
