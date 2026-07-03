import { upload } from '@vercel/blob/client';

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
    console.log(`[Client Upload] starting Vercel Blob client upload for: ${file.name} (size: ${(file.size / (1024 * 1024)).toFixed(2)} MB, project: ${projectId})`);

    // 3. Try Vercel Blob direct client upload
    const blob = await upload(file.name, file, {
      access: 'public',
      handleUploadUrl: '/api/upload/vercel-blob',
      clientPayload: JSON.stringify({
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size,
        projectId: projectId ?? '',
      }),
    });

    console.log('[Client Upload] Vercel Blob upload completed. URL:', blob.url);
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
