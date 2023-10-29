import {
  CloudFront,
  CreateInvalidationCommand,
} from "@aws-sdk/client-cloudfront";
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";

const bucket = "bjornf.dev-uploads";
const region = "eu-west-2";
const cfDist = "EP23KDGK9RC0N";

console.log(123, import.meta.env.AWS_ACCESS_KEY_ID!);

const s3 = new S3Client({
  region,
  credentials: {
    accessKeyId: import.meta.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: import.meta.env.AWS_SECRET_ACCESS_KEY!,
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
    accessKeyId: import.meta.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: import.meta.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export const invalidateCache = async (path: string) => {
  await cf.send(
    new CreateInvalidationCommand({
      DistributionId: cfDist,
      InvalidationBatch: {
        Paths: {
          Quantity: 2,
          Items: ["/", path],
        },
        CallerReference: "astro-dist",
      },
    }),
  );
};
