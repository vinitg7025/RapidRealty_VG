import { S3Client } from '@aws-sdk/client-s3';

export function getBucketConfig() {
  return {
    bucketName: process.env.R2_BUCKET_NAME || process.env.AWS_BUCKET_NAME || '11estates-assets',
    folderPrefix: process.env.AWS_FOLDER_PREFIX ?? '',
  };
}

export function createS3Client() {
  const endpoint = process.env.R2_ENDPOINT || process.env.AWS_ENDPOINT;
  const accessKeyId = process.env.R2_ACCESS_KEY_ID || process.env.AWS_ACCESS_KEY_ID;
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY || process.env.AWS_SECRET_ACCESS_KEY;
  const region = process.env.R2_REGION || process.env.AWS_REGION || 'auto';

  if (endpoint && accessKeyId && secretAccessKey) {
    return new S3Client({
      region,
      endpoint,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
    });
  }

  return new S3Client({});
}

