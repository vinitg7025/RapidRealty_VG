import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { put } from '@vercel/blob';

export async function PUT(request: Request) {
  try {
    // Authenticate user session
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get the destination path
    const { searchParams } = new URL(request.url);
    const filePath = searchParams.get('path');
    if (!filePath) {
      return NextResponse.json({ error: 'Path is required' }, { status: 400 });
    }

    // Read file buffer from the request stream
    const arrayBuffer = await request.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload to Vercel Blob using the SDK
    const blob = await put(filePath, buffer, {
      access: 'public',
      addRandomSuffix: true, // Keep safe from name collisions
    });

    return NextResponse.json({ success: true, url: blob.url });
  } catch (error: any) {
    console.error('Vercel Blob upload error:', error);
    return NextResponse.json({ error: error.message || 'Failed to upload to Vercel Blob' }, { status: 500 });
  }
}
