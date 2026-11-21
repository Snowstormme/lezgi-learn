import { describe, expect, it } from 'vitest';
import robots from '@/app/robots';
import sitemap from '@/app/sitemap';
import { buildPageMetadata, getAbsoluteUrl, getSiteUrl } from '@/lib/seo';

describe('Google indexing & SEO configuration', () => {
  it('generates robots.txt allowing main sections and disallowing private routes', () => {
    const result = robots();
    const rules = Array.isArray(result.rules) ? result.rules[0] : result.rules;

    expect(result.sitemap).toBe(`${getSiteUrl()}/sitemap.xml`);
    expect(rules?.allow).toEqual(
      expect.arrayContaining(['/', '/learn', '/dictionary', '/translate', '/review', '/lesson/'])
    );
    expect(rules?.disallow).toEqual(
      expect.arrayContaining(['/api/', '/profile', '/login', '/lesson/*/result'])
    );
  });

  it('includes all public indexable sections in sitemap.xml with valid priorities', () => {
    const entries = sitemap();
    const urls = entries.map((entry) => entry.url);

    expect(urls).toContain(getAbsoluteUrl('/'));
    expect(urls).toContain(getAbsoluteUrl('/learn'));
    expect(urls).toContain(getAbsoluteUrl('/dictionary'));
    expect(urls).toContain(getAbsoluteUrl('/translate'));
    expect(urls).toContain(getAbsoluteUrl('/review'));
    expect(urls).toContain(getAbsoluteUrl('/lesson/u1-l1-greetings'));
    expect(urls).not.toContain(getAbsoluteUrl('/profile'));
    expect(urls).not.toContain(getAbsoluteUrl('/login'));

    for (const entry of entries) {
      expect(entry.priority).toBeGreaterThan(0);
      expect(entry.priority).toBeLessThanOrEqual(1);
    }
  });

  it('builds canonical, OpenGraph, and robots directives correctly', () => {
    const publicMeta = buildPageMetadata({
      title: 'Словарь',
      description: 'Лезгинско-русский словарь',
      path: '/dictionary',
    });

    expect(publicMeta.alternates?.canonical).toBe(getAbsoluteUrl('/dictionary'));
    expect(publicMeta.openGraph?.url).toBe(getAbsoluteUrl('/dictionary'));
    expect(publicMeta.robots).toMatchObject({ index: true, follow: true });

    const privateMeta = buildPageMetadata({
      title: 'Профиль',
      description: 'Личный кабинет',
      path: '/profile',
      noIndex: true,
    });

    expect(privateMeta.robots).toMatchObject({ index: false, follow: false });
  });
});
