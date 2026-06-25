export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Public route - no auth needed for lead submission
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { micrositeId, name, phone, email, message } = body ?? {};

    if (!micrositeId || !name || !phone) {
      return NextResponse.json({ error: 'Name and phone are required' }, { status: 400 });
    }

    const microsite = await prisma.microsite.findUnique({ where: { id: micrositeId } });
    if (!microsite || microsite.status !== 'PUBLISHED') {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    const lead = await prisma.lead.create({
      data: {
        micrositeId,
        name: name ?? '',
        phone: phone ?? '',
        email: email ?? '',
        message: message ?? '',
        source: 'inquiry_form',
      },
    });

    return NextResponse.json({ success: true, leadId: lead.id });
  } catch (error: any) {
    console.error('Lead submit error:', error);
    return NextResponse.json({ error: 'Failed to submit' }, { status: 500 });
  }
}
