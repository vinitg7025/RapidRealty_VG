export async function uploadFileToS3(file: File, isPublic: boolean = true): Promise<string> {
  // Step 1: Get presigned URL
  const presignRes = await fetch('/api/upload/presigned', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ fileName: file.name, contentType: file.type, isPublic }),
  });

  if (!presignRes.ok) throw new Error('Failed to get upload URL');
  const { uploadUrl, cloud_storage_path } = await presignRes.json();

  // Step 2: Upload directly to S3
  const uploadRes = await fetch(uploadUrl, {
    method: 'PUT',
    headers: { 'Content-Type': file.type },
    body: file,
  });

  if (!uploadRes.ok) throw new Error('Upload failed');

  return cloud_storage_path;
}

export function getPublicUrl(cloud_storage_path: string): string {
  const bucketName = process.env.NEXT_PUBLIC_AWS_BUCKET_NAME ?? '';
  const region = process.env.NEXT_PUBLIC_AWS_REGION ?? 'us-east-1';
  return `https://${bucketName}.s3.${region}.amazonaws.com/${cloud_storage_path}`;
}
