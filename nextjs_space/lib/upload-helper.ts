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

  // 3. Helper function to sanitize name locally for logging & fallback
  const parts = file.name.split('.');
  const ext = parts.pop() || '';
  const base = parts.join('.');
  const cleanBase = base
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
  const sanitizedName = `${cleanBase || 'file'}-${Date.now()}.${ext}`;

  try {
    console.log(`[Client Upload] starting server-side upload for: ${sanitizedName} (size: ${(file.size / (1024 * 1024)).toFixed(2)} MB, project: ${projectId})`);

    // 4. Perform server-side upload using FormData
    const formData = new FormData();
    formData.append('file', file);
    formData.append('projectId', projectId ?? '');

    const res = await fetch('/api/upload/server', {
      method: 'POST',
      body: formData,
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || 'Server-side upload failed');
    }

    console.log('[Client Upload] server-side upload completed. URL:', data.fileUrl);
    return data.fileUrl;
  } catch (error: any) {
    console.warn('[Client Upload] Server-side upload failed, checking local development fallback...', error.message || error);
    
    // Check if we are running locally on localhost
    const isLocalhost = typeof window !== 'undefined' && 
      (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

    if (isLocalhost) {
      console.log('[Client Upload] Localhost environment detected. Falling back to local disk storage.');
      const localPath = `local-uploads/${sanitizedName}`;
      
      // Pass file details and projectId to store metadata locally too
      const localUploadUrl = `/api/upload/local?path=${encodeURIComponent(localPath)}` +
        `&projectId=${encodeURIComponent(projectId ?? '')}` +
        `&fileName=${encodeURIComponent(sanitizedName)}` +
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

    // If not on localhost, throw the original error
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
