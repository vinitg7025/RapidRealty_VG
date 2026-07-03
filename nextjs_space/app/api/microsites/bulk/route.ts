export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const userId = (session.user as any).id;
    const role = (session.user as any).role;
    const body = await request.json();

    const { ids, action } = body;
    if (!Array.isArray(ids) || ids.length === 0 || !action) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
    }

    const authWhere = role === 'ADMIN' ? {} : { createdById: userId };

    if (action === 'publish') {
      await prisma.microsite.updateMany({
        where: { id: { in: ids }, ...authWhere },
        data: { status: 'PUBLISHED' },
      });
      return NextResponse.json({ success: true, message: `${ids.length} microsites published.` });
    }

    if (action === 'archive') {
      await prisma.microsite.updateMany({
        where: { id: { in: ids }, ...authWhere },
        data: { status: 'ARCHIVED' },
      });
      return NextResponse.json({ success: true, message: `${ids.length} microsites archived.` });
    }

    if (action === 'delete') {
      await prisma.microsite.deleteMany({
        where: { id: { in: ids }, ...authWhere },
      });
      return NextResponse.json({ success: true, message: `${ids.length} microsites deleted.` });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error: any) {
    console.error('Bulk operation failed:', error);
    return NextResponse.json({ error: 'Failed to execute bulk action' }, { status: 500 });
  }
}
