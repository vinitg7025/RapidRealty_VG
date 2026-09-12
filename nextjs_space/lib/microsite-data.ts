import { cache } from 'react';
import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { getFileUrl } from '@/lib/s3';

export const APPROVED_SECTIONS = ['pricing', 'floor-plans', 'master-plan', 'connectivity', 'amenities', 'builder', 'faq'];
export const RESERVED_SLUGS = ['dashboard', 'auth', 'api', '_next', 'favicon.ico'];

const parseJsonField = (val: string | null | undefined, fallback: any = []) => {
  if (!val) return fallback;
  try { return JSON.parse(val); } catch { return fallback; }
};

export const getMicrositeBySlug = cache(async (fullSlug: string, isPreview: boolean = false) => {
  if (!fullSlug) return null;

  const microsite = await prisma.microsite.findUnique({
    where: { slug: fullSlug },
  });

  if (!microsite) {
    // Check for redirect record if site is not found
    const redirectRecord = await prisma.slugRedirect.findUnique({
      where: { oldSlug: fullSlug },
    });
    if (redirectRecord) {
      return { redirectUrl: redirectRecord.newSlug };
    }
    return null;
  }

  if (microsite.status !== 'PUBLISHED' && !isPreview) {
    return null;
  }

  // Parse raw JSON data fields
  const heroImagePaths = parseJsonField(microsite.heroImages);
  const galleryImagePaths = parseJsonField(microsite.galleryImages);
  const floorPlanPaths = parseJsonField(microsite.floorPlans);
  const reraQrCodesRaw = parseJsonField(microsite.reraQrCodes);

  const resolveUrls = async (paths: string[]) => {
    return Promise.all(
      (paths ?? []).filter((p: string) => !!p).map(async (p: string) => {
        try {
          return await getFileUrl(p, 'image/jpeg', true);
        } catch {
          return '';
        }
      })
    );
  };

  const [heroImageUrls, galleryImageUrls, floorPlanUrls] = await Promise.all([
    resolveUrls(heroImagePaths),
    resolveUrls(galleryImagePaths),
    resolveUrls(floorPlanPaths),
  ]);

  // Resolve RERA QR code image URLs
  const reraQrCodes = await Promise.all(
    (reraQrCodesRaw ?? []).map(async (item: any) => {
      let qrImageUrl = '';
      if (item?.qrImagePath) {
        try { qrImageUrl = await getFileUrl(item.qrImagePath, 'image/png', true); } catch {}
      }
      return { ...item, qrImageUrl };
    })
  );

  let masterPlanUrl = '';
  if (microsite.masterPlanImage) {
    try { masterPlanUrl = await getFileUrl(microsite.masterPlanImage, 'image/jpeg', true); } catch {}
  }

  let builderLogoUrl = '';
  if (microsite.builderLogoPath) {
    try { builderLogoUrl = await getFileUrl(microsite.builderLogoPath, 'image/png', true); } catch {}
  }

  let brochureUrl = '';
  if (microsite.brochurePath) {
    try { brochureUrl = await getFileUrl(microsite.brochurePath, 'application/pdf', true); } catch {}
  }

  // Resolve floor plan images within pricing data
  const pricingDataRaw = parseJsonField(microsite.pricingData);
  const pricingData = await Promise.all(
    (pricingDataRaw ?? []).map(async (item: any) => {
      let floorPlanImageUrl = '';
      if (item?.floorPlanImage) {
        try { floorPlanImageUrl = await getFileUrl(item.floorPlanImage, 'image/jpeg', true); } catch {}
      }
      return { ...item, floorPlanImageUrl };
    })
  );

  return {
    ...microsite,
    heroImageUrls,
    galleryImageUrls,
    floorPlanUrls,
    masterPlanUrl,
    builderLogoUrl,
    brochureUrl,
    pricingData,
    connectivityData: parseJsonField(microsite.connectivityData),
    amenities: parseJsonField(microsite.amenities),
    faqs: parseJsonField(microsite.faqs),
    projectHighlights: parseJsonField(microsite.projectHighlights),
    reraQrCodes,
  };
});

export function revalidateMicrositePaths(slug: string, oldSlug?: string) {
  if (!slug) return;
  
  const revalidateSlug = (s: string) => {
    revalidatePath(`/${s}`);
    APPROVED_SECTIONS.forEach((section) => {
      revalidatePath(`/${s}/${section}`);
    });
  };

  try {
    revalidateSlug(slug);
    if (oldSlug && oldSlug !== slug) {
      revalidateSlug(oldSlug);
    }
    revalidatePath('/');
    revalidatePath('/sitemap.xml');
  } catch (err) {
    console.error('Error revalidating paths for slug:', slug, err);
  }
}
