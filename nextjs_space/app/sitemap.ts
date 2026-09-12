import { MetadataRoute } from 'next';
import { prisma } from '@/lib/prisma';
import { APPROVED_SECTIONS } from '@/lib/microsite-data';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = (process.env.NEXT_PUBLIC_SITE_URL || 'https://www.11estates.in').replace(/\/+$/, '');

  try {
    const publishedMicrosites = await prisma.microsite.findMany({
      where: { status: 'PUBLISHED' },
      select: { slug: true, updatedAt: true },
    });

    const micrositesEntries: MetadataRoute.Sitemap = [];

    publishedMicrosites.forEach((site) => {
      // Main project URL
      micrositesEntries.push({
        url: `${baseUrl}/${site.slug}`,
        lastModified: site.updatedAt,
        changeFrequency: 'daily',
        priority: 0.8,
      });

      // Approved Section URLs
      APPROVED_SECTIONS.forEach((section) => {
        micrositesEntries.push({
          url: `${baseUrl}/${site.slug}/${section}`,
          lastModified: site.updatedAt,
          changeFrequency: 'daily',
          priority: 0.6,
        });
      });
    });

    const staticEntries: MetadataRoute.Sitemap = [
      {
        url: baseUrl,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: 1.0,
      },
    ];

    return [...staticEntries, ...micrositesEntries];
  } catch (error) {
    console.error('Error generating sitemap:', error);
    return [
      {
        url: baseUrl,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: 1.0,
      },
    ];
  }
}
