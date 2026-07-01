import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
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

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Local upload error:', error);
    return NextResponse.json({ error: 'Failed to upload locally' }, { status: 500 });
  }
}
