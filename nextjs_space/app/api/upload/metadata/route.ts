import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request): Promise<NextResponse> {
  try {
    // Authenticate user session
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { fileName, fileUrl, fileType, fileSize, projectId } = await request.json();

    if (!fileName || !fileUrl || !fileType || !fileSize) {
      return NextResponse.json({ error: 'Missing metadata parameters' }, { status: 400 });
    }

    // Store metadata in Neon database (prisma)
    const metadata = await prisma.fileMetadata.create({
      data: {
        fileName,
        fileUrl,
        fileType,
        fileSize: Number(fileSize),
        projectId: projectId ?? '',
      },
    });

    console.log(`[Metadata Server] successfully stored file metadata in Neon for project ID: ${projectId}`);
    return NextResponse.json({ success: true, metadata });
  } catch (error: any) {
    console.error('[Metadata Server] failed to write metadata to Neon:', error.message || error);
    return NextResponse.json(
      { error: error.message || 'Database write failed' },
      { status: 500 }
    );
  }
}
