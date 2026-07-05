import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    return NextResponse.json({
      hasVercelBlobToken: !!(process.env.PUBLIC_BLOB_READ_WRITE_TOKEN || process.env.BLOB_READ_WRITE_TOKEN),
      hasAwsAccessKey: !!process.env.AWS_ACCESS_KEY_ID,
      hasAwsSecretKey: !!process.env.AWS_SECRET_ACCESS_KEY,
      nodeEnv: process.env.NODE_ENV || 'undefined',
      vercelEnv: process.env.VERCEL_ENV || 'undefined',
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
