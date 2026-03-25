import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';

interface UploadBufferInput {
  objectKey: string;
  body: Buffer;
  contentType: string;
}

interface UploadBufferResult {
  objectKey: string;
  url: string;
  sizeBytes: number;
  contentType: string;
}

@Injectable()
export class StorageService {
  private readonly bucket: string;
  private readonly client: S3Client;

  constructor(private readonly configService: ConfigService) {
    this.bucket = this.configService.get<string>(
      'S3_BUCKET',
      'backflow-compliance',
    );

    this.client = new S3Client({
      region: this.configService.get<string>('S3_REGION', 'us-east-1'),
      endpoint: this.configService.get<string>('S3_ENDPOINT'),
      forcePathStyle:
        this.configService.get<string>('S3_FORCE_PATH_STYLE', 'true') ===
        'true',
      credentials: {
        accessKeyId: this.configService.get<string>(
          'S3_ACCESS_KEY',
          'minioadmin',
        ),
        secretAccessKey: this.configService.get<string>(
          'S3_SECRET_KEY',
          'minioadmin',
        ),
      },
    });
  }

  async uploadBuffer(input: UploadBufferInput): Promise<UploadBufferResult> {
    await this.client.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: input.objectKey,
        Body: input.body,
        ContentType: input.contentType,
      }),
    );

    return {
      objectKey: input.objectKey,
      contentType: input.contentType,
      sizeBytes: input.body.length,
      url: this.getPublicUrl(input.objectKey),
    };
  }

  getPublicUrl(objectKey: string): string {
    const explicitBase = this.configService.get<string>('S3_PUBLIC_BASE_URL');
    if (explicitBase) {
      const normalized = explicitBase.replace(/\/$/, '');
      return `${normalized}/${objectKey}`;
    }

    const endpoint = this.configService
      .get<string>('S3_ENDPOINT', 'http://localhost:9000')
      .replace(/\/$/, '');
    return `${endpoint}/${this.bucket}/${objectKey}`;
  }
}
