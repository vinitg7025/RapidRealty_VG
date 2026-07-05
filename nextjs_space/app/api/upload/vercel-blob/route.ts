import { generateClientTokenFromReadWriteToken } from '@vercel/blob/client';
import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

// Read the Blob RW token, supporting a custom "PUBLIC_BLOB" prefix so a fresh
// public store can be connected without colliding with leftover BLOB_* vars.
const BLOB_TOKEN = process.env.PUBLIC_BLOB_READ_WRITE_TOKEN || process.env.BLOB_READ_WRITE_TOKEN;

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    // 1. Verify a Blob RW token exists
    if (!BLOB_TOKEN) {
      console.error('[Vercel Blob Server] missing token: BLOB_READ_WRITE_TOKEN is not configured');
      return NextResponse.json({ error: 'Storage token is missing on server. Check Vercel environment configuration.' }, { status: 500 });
    }

    // Authenticate user session using cookies (bypasses NEXTAUTH_URL network calls)
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
    if (!token) {
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

    // 4. Generate scoped client token with explicit 1-hour expiration duration
    console.log(`[Vercel Blob Server] generating upload token for pathname: ${pathname}`);
    const validUntil = Date.now() + 60 * 60 * 1000; // 1 hour in ms
    
    const clientToken = await generateClientTokenFromReadWriteToken({
      token: BLOB_TOKEN,
      pathname,
      addRandomSuffix: true,
      validUntil,
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
