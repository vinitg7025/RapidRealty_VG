export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const microsite = await prisma.microsite.findUnique({
      where: { id: params.id },
      include: { createdBy: { select: { name: true, email: true } } },
    });

    if (!microsite) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    return NextResponse.json({ microsite });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const userId = (session.user as any).id;
    const role = (session.user as any).role;
    const body = await request.json();

    const existing = await prisma.microsite.findUnique({ where: { id: params.id } });
    if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    if (role !== 'ADMIN' && existing.createdById !== userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Check slug uniqueness if changed
    if (body.slug && body.slug !== existing.slug) {
      // Check reserved slug protection
      const RESERVED_BUILDER_SLUGS = [
        'commercial', 'residential', 'about', 'contact', 'insights',
        'api', 'admin', 'login', 'dashboard', 'projects', 'project',
        'builder', 'builders'
      ];
      const builderSlug = body.slug.split('/')[0]?.toLowerCase();
      if (RESERVED_BUILDER_SLUGS.includes(builderSlug)) {
        return NextResponse.json(
          { error: 'The builder slug/name cannot be a reserved word (e.g. contact, about, api...)' },
          { status: 400 }
        );
      }

      const slugExists = await prisma.microsite.findUnique({ where: { slug: body.slug } });
      if (slugExists) return NextResponse.json({ error: 'URL slug already taken' }, { status: 400 });

      // Handle redirect mapping if published
      if (existing.status === 'PUBLISHED') {
        const oldSlug = existing.slug;
        const newSlug = body.slug;
        
        // 1. Create or update the redirect from oldSlug to newSlug
        await prisma.slugRedirect.upsert({
          where: { oldSlug },
          update: { newSlug },
          create: { oldSlug, newSlug }
        });

        // 2. Prevent redirect chains: find any existing redirects pointing to oldSlug and update their target to newSlug
        await prisma.slugRedirect.updateMany({
          where: { newSlug: oldSlug },
          data: { newSlug }
        });
      }
    }

    const updateData: any = {};
    const fields = ['slug', 'status', 'projectName', 'builderName', 'location', 'city',
      'possessionDate', 'projectDescription', 'reraNumber', 'projectType',
      'priceRangeMin', 'priceRangeMax', 'builderDescription', 'builderExperience',
      'builderProjects', 'builderTagline', 'builderArea', 'builderOngoing',
      'builderPerspective', 'masterPlanImage', 'builderLogoPath', 'brochurePath', 'legalInfo'];

    fields.forEach((f: string) => { if (body[f] !== undefined) updateData[f] = body[f]; });

    const jsonFields = ['projectHighlights', 'heroImages', 'galleryImages', 'pricingData',
      'connectivityData', 'amenities', 'floorPlans', 'faqs', 'reraQrCodes'];
    jsonFields.forEach((f: string) => { if (body[f] !== undefined) updateData[f] = JSON.stringify(body[f]); });

    console.log('PUT request body:', body);
    console.log('PUT updateData payload:', updateData);
    const microsite = await prisma.microsite.update({ where: { id: params.id }, data: updateData });
    return NextResponse.json({ microsite });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to update' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const userId = (session.user as any).id;
    const role = (session.user as any).role;

    const existing = await prisma.microsite.findUnique({ where: { id: params.id } });
    if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    if (role !== 'ADMIN' && existing.createdById !== userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await prisma.microsite.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to delete' }, { status: 500 });
  }
}
