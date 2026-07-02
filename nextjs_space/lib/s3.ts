import { PutObjectCommand, GetObjectCommand, DeleteObjectCommand, CreateMultipartUploadCommand, UploadPartCommand, CompleteMultipartUploadCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { createS3Client, getBucketConfig } from './aws-config';

function shouldServeInline(contentType: string): boolean {
  return (contentType.startsWith('image/') && contentType !== 'image/svg+xml')
    || contentType.startsWith('video/')
    || contentType.startsWith('audio/');
}

export async function generatePresignedUploadUrl(fileName: string, contentType: string, isPublic: boolean = false) {
  const hasAwsCreds = process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY;
  const hasVercelBlob = !!process.env.BLOB_READ_WRITE_TOKEN;

  if (!hasAwsCreds && hasVercelBlob) {
    const cloud_storage_path = `uploads/${Date.now()}-${fileName}`;
    const uploadUrl = `/api/upload/vercel-blob?path=${encodeURIComponent(cloud_storage_path)}`;
    return { uploadUrl, cloud_storage_path };
  }

  if (!hasAwsCreds) {
    console.log('AWS credentials not detected in env, using local upload fallback');
    const cloud_storage_path = `local-uploads/${Date.now()}-${fileName}`;
    const uploadUrl = `/api/upload/local?path=${encodeURIComponent(cloud_storage_path)}`;
    return { uploadUrl, cloud_storage_path };
  }

  try {
    const s3 = createS3Client();
    const { bucketName, folderPrefix } = getBucketConfig();
    const prefix = isPublic ? `${folderPrefix}public/uploads` : `${folderPrefix}uploads`;
    const cloud_storage_path = `${prefix}/${Date.now()}-${fileName}`;

    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: cloud_storage_path,
      ContentType: contentType,
    });

    const uploadUrl = await getSignedUrl(s3, command, { expiresIn: 3600 });
    return { uploadUrl, cloud_storage_path };
  } catch (error: any) {
    console.warn('S3 client or getSignedUrl failed, falling back to local upload:', error.message || error);
    const cloud_storage_path = `local-uploads/${Date.now()}-${fileName}`;
    const uploadUrl = `/api/upload/local?path=${encodeURIComponent(cloud_storage_path)}`;
    return { uploadUrl, cloud_storage_path };
  }
}

export async function getFileUrl(cloud_storage_path: string, contentType: string, isPublic: boolean) {
  if (cloud_storage_path.startsWith('http://') || cloud_storage_path.startsWith('https://')) {
    return cloud_storage_path;
  }

  if (cloud_storage_path.startsWith('local-uploads/')) {
    return `/${cloud_storage_path}`;
  }

  const hasAwsCreds = process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY;
  if (!hasAwsCreds) {
    // If it's a seed or existing path that isn't local-uploads/ but we don't have AWS credentials,
    // we can return it as-is or fallback. Let's return the standard public S3 URL directly.
    const { bucketName } = getBucketConfig();
    const region = process.env.AWS_REGION ?? 'us-east-1';
    return `https://${bucketName}.s3.${region}.amazonaws.com/${cloud_storage_path}`;
  }

  try {
    const { bucketName } = getBucketConfig();
    const s3 = createS3Client();

    if (isPublic) {
      const region = process.env.AWS_REGION ?? 'us-east-1';
      return `https://${bucketName}.s3.${region}.amazonaws.com/${cloud_storage_path}`;
    }

    const command = new GetObjectCommand({
      Bucket: bucketName,
      Key: cloud_storage_path,
      ResponseContentDisposition: shouldServeInline(contentType) ? 'inline' : 'attachment',
    });

    return getSignedUrl(s3, command, { expiresIn: 3600 });
  } catch (error) {
    // Fallback: return public URL directly if sign fails
    const { bucketName } = getBucketConfig();
    const region = process.env.AWS_REGION ?? 'us-east-1';
    return `https://${bucketName}.s3.${region}.amazonaws.com/${cloud_storage_path}`;
  }
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
