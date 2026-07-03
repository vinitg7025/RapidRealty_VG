import { handleUpload, type HandleUploadBody } from '@vercel/blob/client';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request): Promise<NextResponse> {
  const body = (await request.json()) as HandleUploadBody;

  try {
    // 1. Verify BLOB_READ_WRITE_TOKEN exists
    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      console.error('[Vercel Blob Server] missing token: BLOB_READ_WRITE_TOKEN is not configured in environment variables');
      return NextResponse.json({ error: 'Storage token is missing on server. Check Vercel environment configuration.' }, { status: 500 });
    }

    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname, clientPayload) => {
        // Authenticate user session
        const session = await getServerSession(authOptions);
        if (!session?.user) {
          console.error('[Vercel Blob Server] token generation failure: Unauthorized user attempt');
          throw new Error('Unauthorized');
        }

        // Validate payload details
        if (clientPayload) {
          try {
            const { fileType, fileSize } = JSON.parse(clientPayload);

            // 2. Validate file type
            const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
            if (!allowedTypes.includes(fileType)) {
              console.error(`[Vercel Blob Server] unsupported file type: "${fileType}"`);
              throw new Error(`Unsupported file type: ${fileType}. Only PDFs, JPG, PNG, and WEBP are allowed.`);
            }

            // 3. Validate file size (50 MB limit)
            const maxBytes = 50 * 1024 * 1024;
            if (fileSize > maxBytes) {
              console.error(`[Vercel Blob Server] file too large: ${fileSize} bytes exceeds 50MB limit`);
              throw new Error(`File is too large (${(fileSize / (1024 * 1024)).toFixed(2)} MB). Max limit is 50 MB.`);
            }
          } catch (e: any) {
            console.error('[Vercel Blob Server] token generation failure:', e.message || e);
            throw e;
          }
        }

        return {
          allowedContentTypes: ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'],
          tokenPayload: clientPayload, // Forward to onUploadCompleted
        };
      },
      onUploadCompleted: async ({ blob, tokenPayload }) => {
        console.log('[Vercel Blob Server] client upload completed:', blob);
        
        try {
          if (tokenPayload) {
            const { fileName, fileType, fileSize, projectId } = JSON.parse(tokenPayload);

            if (!projectId) {
              console.error('[Vercel Blob Server] onUploadCompleted failure: missing project ID in token payload');
              return;
            }

            // 4. Store metadata in Neon database (prisma)
            await prisma.fileMetadata.create({
              data: {
                fileName,
                fileUrl: blob.url,
                fileType,
                fileSize: Number(fileSize),
                projectId,
              },
            });
            console.log(`[Vercel Blob Server] successfully stored file metadata in Neon for project ID: ${projectId}`);
          }
        } catch (dbError: any) {
          console.error('[Vercel Blob Server] database write failure on upload completion:', dbError);
          throw dbError;
        }
      },
    });

    return NextResponse.json(jsonResponse);
  } catch (error: any) {
    console.error('[Vercel Blob Server] token generation or handler failure:', error.message || error);
    return NextResponse.json(
      { error: error.message || 'Authentication or upload authorization failed' },
      { status: 400 }
    );
  }
}
