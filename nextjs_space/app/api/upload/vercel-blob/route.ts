import { generateClientTokenFromReadWriteToken } from '@vercel/blob/client';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST(request: Request): Promise<NextResponse> {
  try {
    // 1. Verify BLOB_READ_WRITE_TOKEN exists
    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      console.error('[Vercel Blob Server] missing token: BLOB_READ_WRITE_TOKEN is not configured');
      return NextResponse.json({ error: 'Storage token is missing on server. Check Vercel environment configuration.' }, { status: 500 });
    }

    // Authenticate user session
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      console.error('[Vercel Blob Server] unauthorized attempt to request client token');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { pathname, fileType, fileSize } = body;

    if (!pathname || !fileType) {
      return NextResponse.json({ error: 'pathname and fileType are required' }, { status: 400 });
    }

    // 2. Validate file type
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(fileType)) {
      console.error(`[Vercel Blob Server] unsupported file type: "${fileType}"`);
      return NextResponse.json({ error: `Unsupported file type: ${fileType}. Only PDFs, JPG, PNG, and WEBP are allowed.` }, { status: 400 });
    }

    // 3. Validate file size (50 MB limit)
    const maxBytes = 50 * 1024 * 1024;
    if (fileSize > maxBytes) {
      console.error(`[Vercel Blob Server] file too large: ${fileSize} bytes`);
      return NextResponse.json({ error: `File is too large (${(fileSize / (1024 * 1024)).toFixed(2)} MB). Max limit is 50 MB.` }, { status: 400 });
    }

    // 4. Generate scoped client token
    console.log(`[Vercel Blob Server] generating upload token for pathname: ${pathname}`);
    const clientToken = await generateClientTokenFromReadWriteToken({
      token: process.env.BLOB_READ_WRITE_TOKEN,
      pathname,
    });

    return NextResponse.json({ clientToken });
  } catch (error: any) {
    console.error('[Vercel Blob Server] token generation failure:', error.message || error);
    return NextResponse.json(
      { error: error.message || 'Token generation failed' },
      { status: 500 }
    );
  }
}
