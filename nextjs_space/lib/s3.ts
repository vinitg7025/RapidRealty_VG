import { PutObjectCommand, GetObjectCommand, DeleteObjectCommand, CreateMultipartUploadCommand, UploadPartCommand, CompleteMultipartUploadCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { createS3Client, getBucketConfig } from './aws-config';

function shouldServeInline(contentType: string): boolean {
  return (contentType.startsWith('image/') && contentType !== 'image/svg+xml')
    || contentType.startsWith('video/')
    || contentType.startsWith('audio/');
}

function sanitizeFileName(name: string): string {
  return name.replace(/[^a-zA-Z0-9.-]/g, '_');
}

export async function generatePresignedUploadUrl(
  fileName: string,
  contentType: string,
  isPublic: boolean = true,
  builderSlug?: string,
  projectSlug?: string,
  assetType?: string
) {
  const hasR2Creds = !!(process.env.R2_ENDPOINT && process.env.R2_ACCESS_KEY_ID && process.env.R2_SECRET_ACCESS_KEY);
  const hasAwsCreds = !!(process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY);
  const hasVercelBlob = !!(process.env.PUBLIC_BLOB_READ_WRITE_TOKEN || process.env.BLOB_READ_WRITE_TOKEN);

  const safeFileName = sanitizeFileName(fileName);
  let cloud_storage_path: string;

  if (builderSlug && projectSlug) {
    const cleanAssetType = assetType ? assetType.toLowerCase().replace(/[^a-z0-9-]/g, '') : 'general';
    cloud_storage_path = `projects/${builderSlug}/${projectSlug}/${cleanAssetType}/${Date.now()}-${safeFileName}`;
  } else {
    const folder = assetType ? assetType.toLowerCase().replace(/[^a-z0-9-]/g, '') : 'uploads';
    cloud_storage_path = `projects/_general/${folder}/${Date.now()}-${safeFileName}`;
  }

  // 1. Cloudflare R2 or AWS S3 Presigned Upload
  if (hasR2Creds || hasAwsCreds) {
    try {
      const s3 = createS3Client();
      const { bucketName } = getBucketConfig();

      const command = new PutObjectCommand({
        Bucket: bucketName,
        Key: cloud_storage_path,
        ContentType: contentType,
      });

      const uploadUrl = await getSignedUrl(s3, command, { expiresIn: 3600 });
      const r2PublicUrl = process.env.R2_PUBLIC_URL || process.env.NEXT_PUBLIC_R2_PUBLIC_URL;
      const publicUrl = r2PublicUrl ? `${r2PublicUrl.replace(/\/+$/, '')}/${cloud_storage_path}` : undefined;

      return { uploadUrl, cloud_storage_path, publicUrl, provider: 'r2' };
    } catch (error: any) {
      console.warn('[R2/S3 Storage] Presigned URL generation failed, checking fallbacks:', error.message || error);
    }
  }

  // 2. Vercel Blob Fallback
  if (hasVercelBlob) {
    const blobPath = `uploads/${Date.now()}-${safeFileName}`;
    const uploadUrl = `/api/upload/vercel-blob?path=${encodeURIComponent(blobPath)}`;
    return { uploadUrl, cloud_storage_path: blobPath, provider: 'vercel-blob' };
  }

  // 3. Local Disk Storage Fallback
  console.log('[Storage Provider] Using local upload fallback storage.');
  const localPath = `local-uploads/${Date.now()}-${safeFileName}`;
  const uploadUrl = `/api/upload/local?path=${encodeURIComponent(localPath)}`;
  return { uploadUrl, cloud_storage_path: localPath, provider: 'local' };
}

export async function getFileUrl(cloud_storage_path: string, contentType: string, isPublic: boolean) {
  if (!cloud_storage_path) return '';

  // 1. Full URLs (legacy Vercel Blob, direct R2/S3 URLs)
  if (cloud_storage_path.startsWith('http://') || cloud_storage_path.startsWith('https://')) {
    return cloud_storage_path;
  }

  // 2. Local uploads fallback
  if (cloud_storage_path.startsWith('local-uploads/') || cloud_storage_path.startsWith('/local-uploads/')) {
    return '/' + cloud_storage_path.replace(/^\/+/, '');
  }

  // 3. Configurable Cloudflare R2 Public Base URL (from R2_PUBLIC_URL env var)
  const r2PublicUrl = process.env.R2_PUBLIC_URL || process.env.NEXT_PUBLIC_R2_PUBLIC_URL;
  if (r2PublicUrl) {
    const cleanBase = r2PublicUrl.replace(/\/+$/, '');
    const cleanPath = cloud_storage_path.replace(/^\/+/, '');
    return `${cleanBase}/${cleanPath}`;
  }

  // 4. Cloudflare R2 Default Endpoint
  if (process.env.R2_ENDPOINT) {
    const endpoint = process.env.R2_ENDPOINT.replace(/\/+$/, '');
    const { bucketName } = getBucketConfig();
    return `${endpoint}/${bucketName}/${cloud_storage_path.replace(/^\/+/, '')}`;
  }

  // 5. AWS S3 Fallback
  const { bucketName } = getBucketConfig();
  const region = process.env.AWS_REGION ?? 'us-east-1';
  return `https://${bucketName}.s3.${region}.amazonaws.com/${cloud_storage_path}`;
}

export async function deleteFile(cloud_storage_path: string) {
  const s3 = createS3Client();
  const { bucketName } = getBucketConfig();
  await s3.send(new DeleteObjectCommand({ Bucket: bucketName, Key: cloud_storage_path }));
}

export async function initiateMultipartUpload(fileName: string, contentType: string, isPublic: boolean) {
  const s3 = createS3Client();
  const { bucketName, folderPrefix } = getBucketConfig();
  const prefix = isPublic ? `${folderPrefix}public/uploads` : `${folderPrefix}uploads`;
  const cloud_storage_path = `${prefix}/${Date.now()}-${fileName}`;

  const command = new CreateMultipartUploadCommand({
    Bucket: bucketName,
    Key: cloud_storage_path,
    ContentType: contentType,
  });

  const response = await s3.send(command);
  return { uploadId: response.UploadId, cloud_storage_path };
}

export async function getPresignedUrlForPart(cloud_storage_path: string, uploadId: string, partNumber: number) {
  const s3 = createS3Client();
  const { bucketName } = getBucketConfig();

  const command = new UploadPartCommand({
    Bucket: bucketName,
    Key: cloud_storage_path,
    UploadId: uploadId,
    PartNumber: partNumber,
  });

  return getSignedUrl(s3, command, { expiresIn: 3600 });
}

export async function completeMultipartUpload(cloud_storage_path: string, uploadId: string, parts: Array<{ ETag: string; PartNumber: number }>) {
  const s3 = createS3Client();
  const { bucketName } = getBucketConfig();

  const command = new CompleteMultipartUploadCommand({
    Bucket: bucketName,
    Key: cloud_storage_path,
    UploadId: uploadId,
    MultipartUpload: { Parts: parts },
  });

  await s3.send(command);
}
