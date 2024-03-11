import { PutObjectCommand } from '@aws-sdk/client-s3';
import { randomUUID } from 'crypto';

import { s3 } from '@/lib/s3';

export class S3Controller {
  static async uploadFile(file: File) {
    const extension = file.name.split('.').pop();

    const Body = (await file.arrayBuffer()) as Buffer;
    const Key = `${randomUUID()}.${extension}`;

    const Bucket = process.env.AWS_BUCKET;

    await s3.send(
      new PutObjectCommand({
        Key,
        Body,
        Bucket,
      }),
    );

    return { url: `https://${Bucket}.s3.amazonaws.com/${Key}` };
  }
}
