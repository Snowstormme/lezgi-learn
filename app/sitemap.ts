import type { MetadataRoute } from 'next';
import { getAbsoluteUrl } from '@/lib/seo';

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const sections: Array<{
    path: string;
    changeFrequency: MetadataRoute.Sitemap[number]['changeFrequency'];
    priority: number;
  }> = [
    { path: '/', changeFrequency: 'weekly', priority: 1.0 },
    { path: '/learn', changeFrequency: 'weekly', priority: 0.95 },
    { path: '/dictionary', changeFrequency: 'weekly', priority: 0.9 },
    { path: '/translate', changeFrequency: 'weekly', priority: 0.85 },
    { path: '/lesson/u1-l1-greetings', changeFrequency: 'monthly', priority: 0.85 },
    { path: '/review', changeFrequency: 'weekly', priority: 0.75 },
  ];

  return sections.map((section) => ({
    url: getAbsoluteUrl(section.path),
    lastModified: now,
    changeFrequency: section.changeFrequency,
    priority: section.priority,
  }));
}
