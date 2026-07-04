import { put } from '@vercel/blob/client';

export async function uploadFileToS3(file: File, isPublic: boolean = true, projectId?: string): Promise<string> {
  // 1. Client-side validation: unsupported file type
  const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  if (!allowedTypes.includes(file.type)) {
    console.error('[Client Upload] unsupported file type error:', file.type);
    throw new Error('Unsupported file type. Allowed formats: PDF, JPG, PNG, WEBP.');
  }

  // 2. Client-side validation: file too large (50 MB limit)
  const maxBytes = 50 * 1024 * 1024;
  if (file.size > maxBytes) {
    console.error('[Client Upload] file too large error:', file.size, 'bytes');
    throw new Error(`File is too large (${(file.size / (1024 * 1024)).toFixed(2)} MB). Max limit is 50 MB.`);
  }

  try {
    console.log(`[Client Upload] requesting Vercel Blob client token for: ${file.name}`);

    // 3. Fetch scoped client upload token from the server
    const tokenRes = await fetch('/api/upload/vercel-blob', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        pathname: file.name,
        fileType: file.type,
        fileSize: file.size,
      }),
    });

    if (!tokenRes.ok) {
      const errData = await tokenRes.json();
      throw new Error(errData.error || 'Failed to generate upload token');
    }

    const { clientToken } = await tokenRes.json();

    // 4. Perform client-side upload directly to Vercel Blob using the token (no callback URL)
    console.log('[Client Upload] starting direct upload to Vercel Blob...');
    const blob = await put(file.name, file, {
      access: 'public',
      token: clientToken,
    });

    console.log('[Client Upload] Vercel Blob upload completed. URL:', blob.url);

    // 5. Store file metadata in the Neon database
    console.log('[Client Upload] storing file metadata in Neon database...');
    const metadataRes = await fetch('/api/upload/metadata', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fileName: file.name,
        fileUrl: blob.url,
        fileType: file.type,
        fileSize: file.size,
        projectId: projectId ?? '',
      }),
    });

    if (!metadataRes.ok) {
      console.warn('[Client Upload] Warning: failed to save metadata to Neon database after successful upload.');
    } else {
      console.log('[Client Upload] metadata successfully stored in Neon database');
    }

    return blob.url;
  } catch (error: any) {
    console.warn('[Client Upload] Vercel Blob upload failed, checking local development fallback...', error.message || error);
    
    // Check if we are running locally on localhost
    const isLocalhost = typeof window !== 'undefined' && 
      (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

    if (isLocalhost) {
      console.log('[Client Upload] Localhost environment detected. Falling back to local disk storage.');
      const localPath = `local-uploads/${Date.now()}-${file.name}`;
      
      // Pass file details and projectId to store metadata locally too
      const localUploadUrl = `/api/upload/local?path=${encodeURIComponent(localPath)}` +
        `&projectId=${encodeURIComponent(projectId ?? '')}` +
        `&fileName=${encodeURIComponent(file.name)}` +
        `&fileType=${encodeURIComponent(file.type)}` +
        `&fileSize=${file.size}`;
      
      const uploadRes = await fetch(localUploadUrl, {
        method: 'PUT',
        headers: { 'Content-Type': file.type },
        body: file,
      });
      
      if (!uploadRes.ok) {
        throw new Error('Local upload fallback failed. Make sure the local server is running.');
      }
      
      const resolvedUrl = `/${localPath}`;
      console.log('[Client Upload] local fallback upload completed. URL:', resolvedUrl);
      return resolvedUrl;
    }

    // If not on localhost, throw the original Vercel Blob error
    throw error;
  }
}

export function getPublicUrl(cloud_storage_path: string): string {
  if (cloud_storage_path.startsWith('http://') || cloud_storage_path.startsWith('https://')) {
    return cloud_storage_path;
  }
  const bucketName = process.env.NEXT_PUBLIC_AWS_BUCKET_NAME ?? '';
  const region = process.env.NEXT_PUBLIC_AWS_REGION ?? 'us-east-1';
  return `https://${bucketName}.s3.${region}.amazonaws.com/${cloud_storage_path}`;
}
