export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const userId = (session.user as any).id;
    const role = (session.user as any).role;
    const where = role === 'ADMIN' ? {} : { createdById: userId };

    const [microsites, published, drafts, leads] = await Promise.all([
      prisma.microsite.count({ where }),
      prisma.microsite.count({ where: { ...where, status: 'PUBLISHED' } }),
      prisma.microsite.count({ where: { ...where, status: 'DRAFT' } }),
      prisma.lead.count({
        where: role === 'ADMIN' ? {} : { microsite: { createdById: userId } },
      }),
    ]);

    return NextResponse.json({ microsites, published, drafts, leads });
  } catch (error: any) {
    console.error('Stats error:', error);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
