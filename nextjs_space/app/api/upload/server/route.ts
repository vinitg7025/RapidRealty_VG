import { put } from '@vercel/blob';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

function sanitizeFilename(originalName: string): string {
  const parts = originalName.split('.');
  const ext = parts.pop() || '';
  const base = parts.join('.');
  
  // Clean base name: lowercase, replace spaces and special characters with hyphens
  const cleanBase = base
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
    
  return `${cleanBase || 'file'}-${Date.now()}.${ext}`;
}

export async function POST(request: Request): Promise<NextResponse> {
  try {
    // 1. Authenticate user session
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      console.error('[Server Upload] Unauthorized attempt');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. Read request formData
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const projectId = formData.get('projectId') as string | null;

    if (!file) {
      console.error('[Server Upload] Missing file');
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    if (!projectId) {
      console.error('[Server Upload] Missing projectId');
      return NextResponse.json({ error: 'Project ID is required' }, { status: 400 });
    }

    // 3. Validate file type: PDF, JPG, JPEG, PNG, WEBP
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      console.error('[Server Upload] Unsupported file type:', file.type);
      return NextResponse.json(
        { error: `Unsupported file type: ${file.type}. Allowed formats: PDF, JPG, PNG, WEBP.` },
        { status: 400 }
      );
    }

    // 4. Validate max size 50 MB
    const maxBytes = 50 * 1024 * 1024;
    if (file.size > maxBytes) {
      console.error('[Server Upload] File too large:', file.size);
      return NextResponse.json(
        { error: `File is too large (${(file.size / (1024 * 1024)).toFixed(2)} MB). Max limit is 50 MB.` },
        { status: 400 }
      );
    }

    // 5. Check BLOB_READ_WRITE_TOKEN exists
    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      console.error('[Server Upload] BLOB_READ_WRITE_TOKEN is missing in environment variables');
      return NextResponse.json(
        { error: 'Vercel Blob token is not configured on the server.' },
        { status: 500 }
      );
    }

    // 6. Sanitize filename
    const sanitizedName = sanitizeFilename(file.name);

    // 7. Upload using put from @vercel/blob with access public
    console.log(`[Server Upload] Uploading ${sanitizedName} to Vercel Blob...`);
    const blob = await put(sanitizedName, file, {
      access: 'public',
      token: process.env.BLOB_READ_WRITE_TOKEN,
    });

    console.log('[Server Upload] Upload success. Blob URL:', blob.url);

    // 8. Save metadata to prisma.fileMetadata
    await prisma.fileMetadata.create({
      data: {
        fileName: sanitizedName,
        fileUrl: blob.url,
        fileType: file.type,
        fileSize: file.size,
        projectId,
      },
    });
    console.log('[Server Upload] Metadata saved to database.');

    // 9. Return JSON response
    return NextResponse.json({
      fileUrl: blob.url,
      fileName: sanitizedName,
      fileType: file.type,
      fileSize: file.size,
    });
  } catch (error: any) {
    console.error('[Server Upload] Error during upload process:', error.message || error);
    return NextResponse.json(
      { error: error.message || 'File upload failed' },
      { status: 500 }
    );
  }
}
