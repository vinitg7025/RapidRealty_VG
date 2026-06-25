export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const userId = (session.user as any).id;
    const role = (session.user as any).role;
    const url = new URL(request.url);
    const micrositeId = url.searchParams.get('micrositeId');
    const limit = parseInt(url.searchParams.get('limit') ?? '100');

    const where: any = role === 'ADMIN' ? {} : { microsite: { createdById: userId } };
    if (micrositeId) where.micrositeId = micrositeId;

    const leads = await prisma.lead.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit,
      include: { microsite: { select: { projectName: true, slug: true } } },
    });

    return NextResponse.json({ leads });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
