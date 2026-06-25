export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getFileUrl } from '@/lib/s3';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { cloud_storage_path, contentType, isPublic } = await request.json();
    if (!cloud_storage_path) return NextResponse.json({ error: 'Missing path' }, { status: 400 });

    const url = await getFileUrl(cloud_storage_path, contentType ?? 'application/octet-stream', isPublic ?? true);
    return NextResponse.json({ url });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
