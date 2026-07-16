import MicrositeView from '@/components/microsite/microsite-view';
import { prisma } from '@/lib/prisma';
import { notFound, redirect } from 'next/navigation';
import { getFileUrl } from '@/lib/s3';
import {
  generateOrganizationSchema,
  generateBreadcrumbSchema,
  generateFAQSchema,
  generateResidenceSchema
} from '@/lib/seo';

// Reserve known paths
const RESERVED_SLUGS = ['dashboard', 'auth', 'api', '_next', 'favicon.ico'];

export default async function MicrositePage({
  params,
  searchParams,
}: {
  params: { slug: string[] };
  searchParams: { preview?: string };
}) {
  const slugParts = params?.slug ?? [];
  const fullSlug = slugParts.join('/');
  const isPreview = searchParams?.preview === 'true';

  if (!fullSlug || RESERVED_SLUGS.includes(slugParts[0])) {
    notFound();
  }

  // Check if microsite exists and is published (or is being previewed)
  const microsite = await prisma.microsite.findUnique({
    where: { slug: fullSlug },
  });

  if (!microsite || (microsite.status !== 'PUBLISHED' && !isPreview)) {
    const redirectRecord = await prisma.slugRedirect.findUnique({
      where: { oldSlug: fullSlug },
    });
    if (redirectRecord) {
      redirect(`/${redirectRecord.newSlug}`);
    }
    notFound();
  }

  const parseJsonField = (val: string | null | undefined, fallback: any = []) => {
    if (!val) return fallback;
    try { return JSON.parse(val); } catch { return fallback; }
  };

  const pricing = parseJsonField(microsite.pricingData);
  const faqs = parseJsonField(microsite.faqs);
  const [builderSlug, projectSlug] = fullSlug.split('/');

  const orgSchema = generateOrganizationSchema();
  const breadcrumbSchema = generateBreadcrumbSchema(
    microsite.builderName,
    builderSlug || '',
    microsite.projectName,
    projectSlug || ''
  );
  const residenceSchema = generateResidenceSchema(
    microsite.projectName,
    microsite.builderName,
    microsite.location,
    microsite.city,
    microsite.projectDescription,
    microsite.projectType,
    pricing
  );
  const faqSchema = generateFAQSchema(faqs);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(orgSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(residenceSchema) }}
      />
      {faqSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
      )}
      <MicrositeView slug={fullSlug} projectName={microsite.projectName} />
    </>
  );
}

export async function generateMetadata({ params }: { params: { slug: string[] } }) {
  const fullSlug = (params?.slug ?? []).join('/');
  const microsite = await prisma.microsite.findUnique({
    where: { slug: fullSlug },
    select: { projectName: true, builderName: true, location: true, city: true, status: true, heroImages: true },
  });

  if (!microsite) return { title: 'Not Found' };

  const isPublished = microsite.status === 'PUBLISHED';
  const seoTitle = `${microsite.projectName} | Price, Floor Plans, Amenities & Brochure | 11 Estates`;
  const metaDescription = `Explore ${microsite.projectName} in ${microsite.location}. Latest pricing, floor plans, amenities, brochure and expert guidance from 11 Estates.`;
  const canonicalUrl = `https://www.11estates.in/${fullSlug}`;

  // Resolve hero image for Social Share Image
  let ogImageUrl = 'https://www.11estates.in/og-image.png';
  let heroImages: string[] = [];
  try {
    heroImages = JSON.parse(microsite.heroImages || '[]');
  } catch (e) {}

  if (Array.isArray(heroImages) && heroImages.length > 0 && heroImages[0]) {
    try {
      const fileUrl = await getFileUrl(heroImages[0], 'image/jpeg', true);
      if (fileUrl) {
        if (fileUrl.startsWith('http')) {
          ogImageUrl = fileUrl;
        } else {
          ogImageUrl = `https://www.11estates.in${fileUrl.startsWith('/') ? '' : '/'}${fileUrl}`;
        }
      }
    } catch (e) {
      console.error('Error resolving OG image:', e);
    }
  }

  return {
    title: seoTitle,
    description: metaDescription,
    alternates: {
      canonical: canonicalUrl,
    },
    robots: {
      index: isPublished,
      follow: isPublished,
    },
    openGraph: {
      title: seoTitle,
      description: metaDescription,
      url: canonicalUrl,
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: `${microsite.projectName} Hero Image`,
        },
      ],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: seoTitle,
      description: metaDescription,
      images: [ogImageUrl],
    },
  };
}

