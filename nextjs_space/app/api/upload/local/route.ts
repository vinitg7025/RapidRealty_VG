import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import fs from 'fs';
import path from 'path';

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const filePath = searchParams.get('path');
    if (!filePath) return NextResponse.json({ error: 'Path is required' }, { status: 400 });

    // Ensure path is safe (starts with local-uploads/)
    if (!filePath.startsWith('local-uploads/')) {
      return NextResponse.json({ error: 'Invalid path' }, { status: 400 });
    }

    const arrayBuffer = await request.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const publicDir = path.join(process.cwd(), 'public');
    const localUploadsDir = path.join(publicDir, 'local-uploads');
    
    // Create directory if it doesn't exist
    if (!fs.existsSync(localUploadsDir)) {
      fs.mkdirSync(localUploadsDir, { recursive: true });
    }

    const destPath = path.join(publicDir, filePath);
    fs.writeFileSync(destPath, buffer);

    // Save metadata locally if projectId is provided
    const projectId = searchParams.get('projectId');
    if (projectId) {
      const fileName = searchParams.get('fileName') || path.basename(filePath);
      const fileType = searchParams.get('fileType') || 'application/octet-stream';
      const fileSize = searchParams.get('fileSize') ? Number(searchParams.get('fileSize')) : buffer.length;

      try {
        await prisma.fileMetadata.create({
          data: {
            fileName,
            fileUrl: `/${filePath}`,
            fileType,
            fileSize,
            projectId,
          },
        });
        console.log(`[Local Upload] Successfully saved file metadata in database for project ID: ${projectId}`);
      } catch (dbError) {
        console.error('[Local Upload] Failed to write file metadata to DB:', dbError);
      }
    }

    return NextResponse.json({ success: true, url: `/${filePath}` });
  } catch (error: any) {
    console.error('Local upload error:', error);
    return NextResponse.json({ error: 'Failed to upload locally' }, { status: 500 });
  }
}
