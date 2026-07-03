export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// Auto-save: creates a DRAFT if new, or updates existing
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const userId = (session.user as any).id;
    const body = await request.json();
    const { id, ...formData } = body;

    const buildData = (data: any) => {
      const result: any = {};
      const fields = ['slug', 'status', 'projectName', 'builderName', 'location', 'city',
        'possessionDate', 'projectDescription', 'reraNumber', 'projectType',
        'priceRangeMin', 'priceRangeMax', 'builderDescription', 'builderExperience',
        'builderProjects', 'builderTagline', 'builderArea', 'builderOngoing',
        'builderPerspective', 'masterPlanImage', 'builderLogoPath', 'brochurePath', 'legalInfo'];
      fields.forEach(f => { if (data[f] !== undefined) result[f] = data[f]; });
      const jsonFields = ['projectHighlights', 'heroImages', 'galleryImages', 'pricingData',
        'connectivityData', 'amenities', 'floorPlans', 'faqs', 'reraQrCodes'];
      jsonFields.forEach(f => { if (data[f] !== undefined) result[f] = JSON.stringify(data[f]); });
      return result;
    };

    if (id) {
      // Update existing
      const existing = await prisma.microsite.findUnique({ where: { id } });
      if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 });
      const role = (session.user as any).role;
      if (role !== 'ADMIN' && existing.createdById !== userId) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
      const updateData = buildData(formData);

      // Validate slug if updated during autosave
      if (updateData.slug && updateData.slug !== existing.slug) {
        // Check reserved slug protection
        const RESERVED_BUILDER_SLUGS = [
          'commercial', 'residential', 'about', 'contact', 'insights',
          'api', 'admin', 'login', 'dashboard', 'projects', 'project',
          'builder', 'builders'
        ];
        const builderSlug = updateData.slug.split('/')[0]?.toLowerCase();
        if (RESERVED_BUILDER_SLUGS.includes(builderSlug)) {
          return NextResponse.json(
            { error: 'The builder slug/name cannot be a reserved word (e.g. contact, about, api...)' },
            { status: 400 }
          );
        }

        const slugExists = await prisma.microsite.findUnique({ where: { slug: updateData.slug } });
        if (slugExists) {
          return NextResponse.json({ error: 'Slug already taken' }, { status: 400 });
        }

        // Handle redirect mapping if published
        if (existing.status === 'PUBLISHED') {
          const oldSlug = existing.slug;
          const newSlug = updateData.slug;
          
          await prisma.slugRedirect.upsert({
            where: { oldSlug },
            update: { newSlug },
            create: { oldSlug, newSlug }
          });

          await prisma.slugRedirect.updateMany({
            where: { newSlug: oldSlug },
            data: { newSlug }
          });
        }
      }

      console.log('Autosave updateData payload:', updateData);
      const microsite = await prisma.microsite.update({ where: { id }, data: updateData });
      return NextResponse.json({ microsite, isNew: false });
    } else {
      // Create new draft
      if (!formData.slug || !formData.projectName) {
        return NextResponse.json({ error: 'Project name and slug required for auto-save' }, { status: 400 });
      }

      // Check reserved slug protection
      const RESERVED_BUILDER_SLUGS = [
        'commercial', 'residential', 'about', 'contact', 'insights',
        'api', 'admin', 'login', 'dashboard', 'projects', 'project',
        'builder', 'builders'
      ];
      const builderSlug = formData.slug.split('/')[0]?.toLowerCase();
      if (RESERVED_BUILDER_SLUGS.includes(builderSlug)) {
        return NextResponse.json(
          { error: 'The builder slug/name cannot be a reserved word (e.g. contact, about, api...)' },
          { status: 400 }
        );
      }

      // Check slug
      const existingSlug = await prisma.microsite.findUnique({ where: { slug: formData.slug } });
      if (existingSlug) {
        return NextResponse.json({ error: 'Slug already taken' }, { status: 400 });
      }
      const data = buildData(formData);
      const microsite = await prisma.microsite.create({
        data: {
          ...data,
          slug: formData.slug,
          projectName: formData.projectName ?? '',
          builderName: formData.builderName ?? '',
          location: formData.location ?? '',
          status: 'DRAFT',
          createdById: userId,
        },
      });
      return NextResponse.json({ microsite, isNew: true });
    }
  } catch (error: any) {
    console.error('Autosave error:', error);
    return NextResponse.json({ error: 'Auto-save failed' }, { status: 500 });
  }
}
