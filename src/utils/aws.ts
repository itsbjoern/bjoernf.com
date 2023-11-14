import {
  CloudFront,
  CreateInvalidationCommand,
} from "@aws-sdk/client-cloudfront";
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";

const bucket = "bjoernf.com-uploads";
const region = "eu-west-2";
const cfDist = "EP23KDGK9RC0N";

const s3 = new S3Client({
  region,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY!,
    secretAccessKey: process.env.AWS_SECRET_KEY!,
  },
});

export const uploadFile = async (
  fileName: string,
  contentType: string,
  fileData: Buffer,
) => {
  await s3.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: fileName,
      ContentType: contentType,
      Body: fileData,
    }),
  );
};

const cf = new CloudFront({
  region,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY!,
    secretAccessKey: process.env.AWS_SECRET_KEY!,
  },
});

export const invalidateCache = async (path: string) => {
  if (import.meta.env.DEV) {
    return;
  }
  await cf.send(
    new CreateInvalidationCommand({
      DistributionId: cfDist,
      InvalidationBatch: {
        Paths: {
          Quantity: 3,
          Items: ["/", "/rss*", path],
        },
        CallerReference: "astro-dist",
      },
    }),
  );
};
