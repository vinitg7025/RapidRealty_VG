import { put } from '@vercel/blob/client';

export async function uploadFileToS3(
  file: File,
  isPublic: boolean = true,
  projectId?: string,
  builderSlug?: string,
  projectSlug?: string,
  assetType?: string
): Promise<string> {
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

  let finalUrl = '';

  try {
    // 3. Request upload URL / provider strategy from server
    console.log(`[Client Upload] requesting presigned upload config for: ${file.name}`);
    const presignedRes = await fetch('/api/upload/presigned', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fileName: file.name,
        contentType: file.type,
        isPublic,
        builderSlug,
        projectSlug,
        assetType,
      }),
    });

    if (presignedRes.ok) {
      const { uploadUrl, cloud_storage_path, publicUrl, provider } = await presignedRes.json();

      // R2 / S3 Presigned Upload Route
      if (provider === 'r2' && uploadUrl) {
        console.log(`[Client Upload] Uploading directly to Cloudflare R2 (${cloud_storage_path})...`);
        const putRes = await fetch(uploadUrl, {
          method: 'PUT',
          headers: { 'Content-Type': file.type },
          body: file,
        });

        if (!putRes.ok) {
          throw new Error(`R2 storage upload failed with status ${putRes.status}`);
        }

        finalUrl = publicUrl || cloud_storage_path;
        console.log('[Client Upload] R2 upload completed successfully. Asset path:', finalUrl);
      }
      // Vercel Blob Route Fallback
      else if (provider === 'vercel-blob') {
        console.log('[Client Upload] Falling back to Vercel Blob upload...');
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
          throw new Error(errData.error || 'Failed to generate Vercel Blob upload token');
        }

        const { clientToken } = await tokenRes.json();
        const blob = await put(file.name, file, { access: 'public', token: clientToken });
        finalUrl = blob.url;
        console.log('[Client Upload] Vercel Blob upload completed. URL:', finalUrl);
      }
      // Local Storage Fallback
      else if (provider === 'local' || uploadUrl.includes('/api/upload/local')) {
        console.log('[Client Upload] Local storage route detected.');
        const localUploadUrl = `${uploadUrl}&projectId=${encodeURIComponent(projectId ?? '')}&fileName=${encodeURIComponent(file.name)}&fileType=${encodeURIComponent(file.type)}&fileSize=${file.size}`;
        const localRes = await fetch(localUploadUrl, {
          method: 'PUT',
          headers: { 'Content-Type': file.type },
          body: file,
        });

        if (!localRes.ok) {
          throw new Error('Local upload failed.');
        }

        finalUrl = `/${cloud_storage_path}`;
        console.log('[Client Upload] Local upload completed. Path:', finalUrl);
      }
    }

    if (!finalUrl) {
      throw new Error('No upload strategy succeeded.');
    }

    // 4. Store file metadata in database
    try {
      await fetch('/api/upload/metadata', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileName: file.name,
          fileUrl: finalUrl,
          fileType: file.type,
          fileSize: file.size,
          projectId: projectId ?? '',
        }),
      });
    } catch (metaErr) {
      console.warn('[Client Upload] Non-fatal warning: failed to write metadata:', metaErr);
    }

    return finalUrl;
  } catch (error: any) {
    console.warn('[Client Upload] Upload failed, checking localhost fallback...', error.message || error);

    const isLocalhost = typeof window !== 'undefined' &&
      (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

    if (isLocalhost) {
      console.log('[Client Upload] Localhost environment fallback...');
      const localPath = `local-uploads/${Date.now()}-${file.name}`;
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
        throw new Error('Local upload fallback failed.');
      }

      const resolvedUrl = `/${localPath}`;
      return resolvedUrl;
    }

    throw error;
  }
}

export function getPublicUrl(cloud_storage_path: string): string {
  if (!cloud_storage_path) return '';
  if (cloud_storage_path.startsWith('http://') || cloud_storage_path.startsWith('https://')) {
    return cloud_storage_path;
  }
  const r2PublicUrl = process.env.NEXT_PUBLIC_R2_PUBLIC_URL || process.env.R2_PUBLIC_URL;
  if (r2PublicUrl) {
    return `${r2PublicUrl.replace(/\/+$/, '')}/${cloud_storage_path.replace(/^\/+/, '')}`;
  }
  const bucketName = process.env.NEXT_PUBLIC_AWS_BUCKET_NAME ?? process.env.R2_BUCKET_NAME ?? '';
  const region = process.env.NEXT_PUBLIC_AWS_REGION ?? 'us-east-1';
  return `https://${bucketName}.s3.${region}.amazonaws.com/${cloud_storage_path}`;
}
