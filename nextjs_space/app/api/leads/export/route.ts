export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const role = (session.user as any).role;
    if (role !== 'ADMIN') return NextResponse.json({ error: 'Admin only' }, { status: 403 });

    const url = new URL(request.url);
    const micrositeId = url.searchParams.get('micrositeId');
    const where: any = micrositeId ? { micrositeId } : {};

    const leads = await prisma.lead.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: { microsite: { select: { projectName: true, slug: true } } },
    });

    // Generate CSV
    const headers = ['Name', 'Phone', 'Email', 'Project', 'Message', 'Source', 'Date'];
    const rows = (leads ?? []).map((l: any) => [
      `"${(l?.name ?? '').replace(/"/g, '""')}"`,
      `"${l?.phone ?? ''}"`,
      `"${l?.email ?? ''}"`,
      `"${l?.microsite?.projectName ?? ''}"`,
      `"${(l?.message ?? '').replace(/"/g, '""').replace(/\n/g, ' ')}"`,
      `"${l?.source ?? ''}"`,
      `"${l?.createdAt ? new Date(l.createdAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }) : ''}"`,
    ]);

    const csv = [headers.join(','), ...rows.map((r: any) => r.join(','))].join('\n');

    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="leads-${Date.now()}.csv"`,
      },
    });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
