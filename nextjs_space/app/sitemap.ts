import { MetadataRoute } from 'next';
import { prisma } from '@/lib/prisma';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  try {
    const publishedMicrosites = await prisma.microsite.findMany({
      where: { status: 'PUBLISHED' },
      select: { slug: true, updatedAt: true },
    });

    const micrositesEntries = publishedMicrosites.map((site) => ({
      url: `https://www.11estates.in/${site.slug}`,
      lastModified: site.updatedAt,
      changeFrequency: 'daily' as const,
      priority: 0.8,
    }));

    const staticEntries = [
      {
        url: 'https://www.11estates.in',
        lastModified: new Date(),
        changeFrequency: 'weekly' as const,
        priority: 1.0,
      },
    ];

    return [...staticEntries, ...micrositesEntries];
  } catch (error) {
    console.error('Error generating sitemap:', error);
    return [
      {
        url: 'https://www.11estates.in',
        lastModified: new Date(),
        changeFrequency: 'weekly' as const,
        priority: 1.0,
      },
    ];
  }
}
