export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getFileUrl } from '@/lib/s3';

export async function GET(request: Request, { params }: { params: { builderSlug: string; projectSlug: string } }) {
  try {
    const { builderSlug, projectSlug } = params;
    const fullSlug = `${builderSlug}/${projectSlug}`;

    // 1. Fetch the project where builderSlug and projectSlug match
    let microsite = await prisma.microsite.findUnique({
      where: { slug: fullSlug },
    });

    if (!microsite) {
      // Check if redirect exists
      const redirectRecord = await prisma.slugRedirect.findUnique({
        where: { oldSlug: fullSlug },
      });
      
      if (redirectRecord) {
        // Redirect to new URL (HTTP 308 Permanent Redirect)
        const redirectUrl = new URL(`/api/projects/${redirectRecord.newSlug}`, request.url);
        return NextResponse.redirect(redirectUrl, 308);
      }

      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    // 2. Return project data only when status is PUBLISHED
    // 3. Return 404 when draft/unpublished
    if (microsite.status !== 'PUBLISHED') {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    // 4. Do not expose admin-only data (omit createdById)
    const { createdById, ...publicMicrosite } = microsite;

    // 5. Include all public content needed to render the existing project page
    const parseJsonField = (val: string | null | undefined, fallback: any = []) => {
      if (!val) return fallback;
      try { return JSON.parse(val); } catch { return fallback; }
    };

    const heroImagePaths = parseJsonField(publicMicrosite.heroImages);
    const galleryImagePaths = parseJsonField(publicMicrosite.galleryImages);
    const floorPlanPaths = parseJsonField(publicMicrosite.floorPlans);
    const reraQrCodesRaw = parseJsonField(publicMicrosite.reraQrCodes);

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
    if (publicMicrosite.masterPlanImage) {
      try { masterPlanUrl = await getFileUrl(publicMicrosite.masterPlanImage, 'image/jpeg', true); } catch {}
    }

    let builderLogoUrl = '';
    if (publicMicrosite.builderLogoPath) {
      try { builderLogoUrl = await getFileUrl(publicMicrosite.builderLogoPath, 'image/png', true); } catch {}
    }

    let brochureUrl = '';
    if (publicMicrosite.brochurePath) {
      try { brochureUrl = await getFileUrl(publicMicrosite.brochurePath, 'application/pdf', true); } catch {}
    }

    // Resolve floor plan images within pricing data
    const pricingDataRaw = parseJsonField(publicMicrosite.pricingData);
    const pricingData = await Promise.all(
      (pricingDataRaw ?? []).map(async (item: any) => {
        let floorPlanImageUrl = '';
        if (item?.floorPlanImage) {
          try { floorPlanImageUrl = await getFileUrl(item.floorPlanImage, 'image/jpeg', true); } catch {}
        }
        return { ...item, floorPlanImageUrl };
      })
    );

    // 6. Include SEO fields if available
    const seoTitle = `${publicMicrosite.projectName} by ${publicMicrosite.builderName} | 11 Estates`;
    const seoDescription = `${publicMicrosite.projectName} in ${publicMicrosite.location}${publicMicrosite.city ? `, ${publicMicrosite.city}` : ''} by ${publicMicrosite.builderName}. Get the best deal with 11 Estates.`;

    const seo = {
      title: seoTitle,
      description: seoDescription,
      images: heroImageUrls,
      location: `${publicMicrosite.location}${publicMicrosite.city ? `, ${publicMicrosite.city}` : ''}`,
      builderName: publicMicrosite.builderName,
      projectName: publicMicrosite.projectName
    };

    return NextResponse.json({
      ...publicMicrosite,
      heroImageUrls,
      galleryImageUrls,
      floorPlanUrls,
      masterPlanUrl,
      builderLogoUrl,
      brochureUrl,
      pricingData,
      connectivityData: parseJsonField(publicMicrosite.connectivityData),
      amenities: parseJsonField(publicMicrosite.amenities),
      faqs: parseJsonField(publicMicrosite.faqs),
      projectHighlights: parseJsonField(publicMicrosite.projectHighlights),
      reraQrCodes,
      seo
    });
  } catch (error: any) {
    console.error('Projects API error:', error);
    return NextResponse.json({ error: 'Failed to fetch project' }, { status: 500 });
  }
}
