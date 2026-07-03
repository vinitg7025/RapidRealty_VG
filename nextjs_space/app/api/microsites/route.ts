export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

import { getFileUrl } from '@/lib/s3';

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const userId = (session.user as any).id;
    const role = (session.user as any).role;
    const where = role === 'ADMIN' ? {} : { createdById: userId };

    const microsites = await prisma.microsite.findMany({
      where,
      orderBy: { updatedAt: 'desc' },
      include: { createdBy: { select: { name: true, email: true } }, _count: { select: { leads: true } } },
    });

    const resolvedMicrosites = await Promise.all(
      microsites.map(async (m) => {
        let thumbnailUrl = '';
        try {
          const heroImages = JSON.parse(m.heroImages || '[]');
          if (Array.isArray(heroImages) && heroImages.length > 0 && heroImages[0]) {
            thumbnailUrl = await getFileUrl(heroImages[0], 'image/jpeg', true);
          }
        } catch (e) {
          // ignore
        }
        return {
          ...m,
          thumbnailUrl,
        };
      })
    );

    return NextResponse.json({ microsites: resolvedMicrosites });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const userId = (session.user as any).id;
    const body = await request.json();

    // Check reserved slug protection
    const RESERVED_BUILDER_SLUGS = [
      'commercial', 'residential', 'about', 'contact', 'insights',
      'api', 'admin', 'login', 'dashboard', 'projects', 'project',
      'builder', 'builders'
    ];
    if (body.slug) {
      const builderSlug = body.slug.split('/')[0]?.toLowerCase();
      if (RESERVED_BUILDER_SLUGS.includes(builderSlug)) {
        return NextResponse.json(
          { error: 'The builder slug/name cannot be a reserved word (e.g. contact, about, api...)' },
          { status: 400 }
        );
      }
    }

    // Check slug uniqueness
    const existingSlug = await prisma.microsite.findUnique({ where: { slug: body.slug } });
    if (existingSlug) {
      return NextResponse.json({ error: 'This URL slug is already taken' }, { status: 400 });
    }

    const microsite = await prisma.microsite.create({
      data: {
        slug: body.slug,
        status: body.status ?? 'DRAFT',
        createdById: userId,
        projectName: body.projectName ?? '',
        builderName: body.builderName ?? '',
        location: body.location ?? '',
        city: body.city ?? '',
        possessionDate: body.possessionDate ?? '',
        projectDescription: body.projectDescription ?? '',
        reraNumber: body.reraNumber ?? '',
        projectType: body.projectType ?? '',
        priceRangeMin: body.priceRangeMin ?? '',
        priceRangeMax: body.priceRangeMax ?? '',
        projectHighlights: JSON.stringify(body.projectHighlights ?? []),
        builderDescription: body.builderDescription ?? '',
        builderExperience: body.builderExperience ?? '',
        builderProjects: body.builderProjects ?? '',
        builderTagline: body.builderTagline ?? '',
        builderArea: body.builderArea ?? '',
        builderOngoing: body.builderOngoing ?? '',
        builderPerspective: body.builderPerspective ?? '',
        heroImages: JSON.stringify(body.heroImages ?? []),
        galleryImages: JSON.stringify(body.galleryImages ?? []),
        masterPlanImage: body.masterPlanImage ?? '',
        builderLogoPath: body.builderLogoPath ?? '',
        brochurePath: body.brochurePath ?? '',
        pricingData: JSON.stringify(body.pricingData ?? []),
        connectivityData: JSON.stringify(body.connectivityData ?? []),
        amenities: JSON.stringify(body.amenities ?? []),
        floorPlans: JSON.stringify(body.floorPlans ?? []),
        faqs: JSON.stringify(body.faqs ?? []),
        legalInfo: body.legalInfo ?? '',
        reraQrCodes: JSON.stringify(body.reraQrCodes ?? []),
      },
    });

    return NextResponse.json({ microsite });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to create microsite' }, { status: 500 });
  }
}
