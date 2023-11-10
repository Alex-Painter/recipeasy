// www.prisma.io/docs/guides/performance-and-optimization/connection-management#prevent-hot-reloading-from-creating-new-instances-of-prismaclient
import { S3Client } from "@aws-sdk/client-s3";

const globalForS3Client = globalThis as unknown as { s3Client: S3Client };

export const s3Client =
  globalForS3Client.s3Client ||
  new S3Client({
    region: process.env.BUCKET_MANAGER_REGION,
    credentials: {
      accessKeyId: process.env.BUCKET_MANAGER_ACCESS_KEY_ID!,
      secretAccessKey: process.env.BUCKET_MANAGER_SECRET_KEY!,
    },
  });

if (process.env.NODE_ENV !== "production") {
  globalForS3Client.s3Client = s3Client;
}
