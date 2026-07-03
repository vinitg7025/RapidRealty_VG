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

    // 3. Perform client-side upload directly to Vercel Blob via handleUpload endpoint token
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

    console.log('[Client Upload] upload completed successfully. Blob URL:', blob.url);
    return blob.url;
  } catch (error: any) {
    console.error('[Client Upload] blob upload failure error:', error.message || error);
    throw new Error(error.message || 'File upload failed');
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
