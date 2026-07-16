import MicrositeView from '@/components/microsite/microsite-view';
import { prisma } from '@/lib/prisma';
import { notFound, redirect } from 'next/navigation';
import { getFileUrl } from '@/lib/s3';
import {
  generateOrganizationSchema,
  generateBreadcrumbSchema,
  generateFAQSchema,
  generateResidenceSchema,
  generateSectionMetadata
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
  
  if (slugParts.length < 2 || slugParts.length > 3) {
    notFound();
  }

  const [builderSlug, projectSlug, sectionSlug] = slugParts;
  const APPROVED_SECTIONS = ['pricing', 'floor-plans', 'master-plan', 'connectivity', 'amenities', 'builder', 'faq'];

  if (sectionSlug && !APPROVED_SECTIONS.includes(sectionSlug)) {
    notFound();
  }

  const fullSlug = `${builderSlug}/${projectSlug}`;
  const isPreview = searchParams?.preview === 'true';

  if (!builderSlug || RESERVED_SLUGS.includes(builderSlug)) {
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

  const orgSchema = generateOrganizationSchema();
  const breadcrumbSchema = generateBreadcrumbSchema(
    microsite.builderName,
    builderSlug,
    microsite.projectName,
    projectSlug
  );
  const residenceSchema = generateResidenceSchema(
    microsite.projectName,
    microsite.builderName,
    microsite.location,
    microsite.city,
    microsite.projectDescription,
    microsite.projectType,
    pricing,
    builderSlug,
    projectSlug
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
      <MicrositeView slug={fullSlug} projectName={microsite.projectName} sectionSlug={sectionSlug} />
    </>
  );
}

export async function generateMetadata({ params }: { params: { slug: string[] } }) {
  const slugParts = params?.slug ?? [];
  if (slugParts.length < 2 || slugParts.length > 3) {
    return { title: 'Not Found' };
  }

  const [builderSlug, projectSlug, sectionSlug] = slugParts;
  const APPROVED_SECTIONS = ['pricing', 'floor-plans', 'master-plan', 'connectivity', 'amenities', 'builder', 'faq'];

  if (sectionSlug && !APPROVED_SECTIONS.includes(sectionSlug)) {
    return { title: 'Not Found' };
  }

  const fullSlug = `${builderSlug}/${projectSlug}`;
  const microsite = await prisma.microsite.findUnique({
    where: { slug: fullSlug },
    select: { projectName: true, builderName: true, location: true, city: true, status: true, heroImages: true },
  });

  if (!microsite) return { title: 'Not Found' };

  const isPublished = microsite.status === 'PUBLISHED';
  const { title, description } = generateSectionMetadata({
    projectName: microsite.projectName,
    builderName: microsite.builderName,
    location: microsite.location,
    city: microsite.city,
    sectionSlug,
  });

  const canonicalUrl = `https://www.11estates.in/${fullSlug}`;
  const pageUrl = sectionSlug ? `${canonicalUrl}/${sectionSlug}` : canonicalUrl;

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
    title,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    robots: {
      index: isPublished,
      follow: isPublished,
    },
    openGraph: {
      title,
      description,
      url: pageUrl,
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
      title,
      description,
      images: [ogImageUrl],
    },
  };
}


