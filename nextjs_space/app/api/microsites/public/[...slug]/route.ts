export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getFileUrl } from '@/lib/s3';

export async function GET(request: Request, { params }: { params: { slug: string[] } }) {
  try {
    const { searchParams } = new URL(request.url);
    const isPreview = searchParams.get('preview') === 'true';
    const fullSlug = (params?.slug ?? []).join('/');
    const microsite = await prisma.microsite.findUnique({
      where: { slug: fullSlug },
    });

    if (!microsite || (microsite.status !== 'PUBLISHED' && !isPreview)) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    // Generate URLs for uploaded assets
    const parseJsonField = (val: string | null | undefined, fallback: any = []) => {
      if (!val) return fallback;
      try { return JSON.parse(val); } catch { return fallback; }
    };

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

    return NextResponse.json({
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
    });
  } catch (error: any) {
    console.error('Public microsite error:', error);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
