export const revalidate = 3600;

import MicrositeView from '@/components/microsite/microsite-view';
import { notFound, redirect } from 'next/navigation';
import { getMicrositeBySlug, APPROVED_SECTIONS, RESERVED_SLUGS } from '@/lib/microsite-data';
import {
  generateOrganizationSchema,
  generateBreadcrumbSchema,
  generateFAQSchema,
  generateResidenceSchema,
  generateSectionMetadata,
  constructMetadata
} from '@/lib/seo';

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

  if (sectionSlug && !APPROVED_SECTIONS.includes(sectionSlug)) {
    notFound();
  }

  const fullSlug = `${builderSlug}/${projectSlug}`;
  const isPreview = searchParams?.preview === 'true';

  if (!builderSlug || RESERVED_SLUGS.includes(builderSlug)) {
    notFound();
  }

  const result = await getMicrositeBySlug(fullSlug, isPreview);

  if (!result) {
    notFound();
  }

  if ('redirectUrl' in result && typeof result.redirectUrl === 'string') {
    return redirect(`/${result.redirectUrl}`);
  }

  const microsite = result as any;
  const pricing = microsite.pricingData ?? [];
  const faqs = microsite.faqs ?? [];

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
      <MicrositeView
        slug={fullSlug}
        projectName={microsite.projectName}
        sectionSlug={sectionSlug}
        initialData={microsite}
      />
    </>
  );
}

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: { slug: string[] };
  searchParams?: { preview?: string };
}) {
  const slugParts = params?.slug ?? [];
  if (slugParts.length < 2 || slugParts.length > 3) {
    return { title: 'Not Found' };
  }

  const [builderSlug, projectSlug, sectionSlug] = slugParts;

  if (sectionSlug && !APPROVED_SECTIONS.includes(sectionSlug)) {
    return { title: 'Not Found' };
  }

  const fullSlug = `${builderSlug}/${projectSlug}`;
  const isPreview = searchParams?.preview === 'true';

  const result = await getMicrositeBySlug(fullSlug, isPreview);

  if (!result || 'redirectUrl' in result) return { title: 'Not Found' };

  const microsite = result as any;
  const isPublished = microsite.status === 'PUBLISHED';
  const { title, description } = generateSectionMetadata({
    projectName: microsite.projectName,
    builderName: microsite.builderName,
    location: microsite.location,
    city: microsite.city,
    sectionSlug,
  });

  let ogImageUrl = 'https://www.11estates.in/og-image.png';

  const heroImages = microsite.heroImageUrls ?? [];
  if (Array.isArray(heroImages) && heroImages.length > 0 && heroImages[0]) {
    const fileUrl = heroImages[0];
    if (fileUrl.startsWith('http')) {
      ogImageUrl = fileUrl;
    } else {
      ogImageUrl = `https://www.11estates.in${fileUrl.startsWith('/') ? '' : '/'}${fileUrl}`;
    }
  }

  return constructMetadata({
    title,
    description,
    path: sectionSlug ? `${fullSlug}/${sectionSlug}` : fullSlug,
    ogImage: ogImageUrl,
    noindex: !isPublished,
  });
}
