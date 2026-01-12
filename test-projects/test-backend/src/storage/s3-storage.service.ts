import { Injectable, Logger } from '@nestjs/common';
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
  HeadObjectCommand,
  DeleteObjectsCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import {
  IStorageService,
  UploadResult,
  UploadOptions,
} from './interfaces/storage.interface';
import type { StorageConfig } from './interfaces/storage.interface';
import { logError } from '../common/utils/error-handler.util';

@Injectable()
export class S3StorageService implements IStorageService {
  private readonly logger = new Logger(S3StorageService.name);
  private readonly s3Client: S3Client;
  private readonly bucket: string;

  constructor(config: StorageConfig) {
    this.bucket = config.bucket;
    this.s3Client = new S3Client({
      region: config.region,
      endpoint: config.endpoint,
      forcePathStyle: true,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || 'test',
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || 'test',
      },
    });
  }

  async upload(file: Buffer, options: UploadOptions): Promise<UploadResult> {
    try {
      const command = new PutObjectCommand({
        Bucket: this.bucket,
        Key: options.key,
        Body: file,
        ContentType: options.mimeType,
        Metadata: options.metadata,
      });

      const result = await this.s3Client.send(command);

      return {
        key: options.key,
        bucket: this.bucket,
        url: `${this.s3Client.config.endpoint}/${this.bucket}/${options.key}`,
        etag: result.ETag || '',
      };
    } catch (error) {
      logError(error, 'S3StorageService.upload', this.logger);
      throw error;
    }
  }

  async batchUpload(
    files: Array<{ buffer: Buffer; options: UploadOptions }>,
  ): Promise<UploadResult[]> {
    const CONCURRENCY_LIMIT = 10;
    const results: UploadResult[] = [];

    for (let i = 0; i < files.length; i += CONCURRENCY_LIMIT) {
      const batch = files.slice(i, i + CONCURRENCY_LIMIT);
      const promises = batch.map(({ buffer, options }) =>
        this.upload(buffer, options),
      );
      const batchResults = await Promise.all(promises);
      results.push(...batchResults);
    }

    return results;
  }

  async delete(key: string): Promise<void> {
    try {
      const command = new DeleteObjectCommand({
        Bucket: this.bucket,
        Key: key,
      });
      await this.s3Client.send(command);
    } catch (error) {
      logError(error, 'S3StorageService.delete', this.logger);
      throw error;
    }
  }

  async batchDelete(keys: string[]): Promise<void> {
    try {
      const command = new DeleteObjectsCommand({
        Bucket: this.bucket,
        Delete: {
          Objects: keys.map((key) => ({ Key: key })),
        },
      });
      await this.s3Client.send(command);
    } catch (error) {
      logError(error, 'S3StorageService.batchDelete', this.logger);
      throw error;
    }
  }

  async getSignedUrl(key: string, expiresIn = 3600): Promise<string> {
    try {
      const command = new GetObjectCommand({
        Bucket: this.bucket,
        Key: key,
      });
      return await getSignedUrl(this.s3Client, command, { expiresIn });
    } catch (error) {
      logError(error, 'S3StorageService.getSignedUrl', this.logger);
      throw error;
    }
  }

  async fileExists(key: string): Promise<boolean> {
    try {
      const command = new HeadObjectCommand({
        Bucket: this.bucket,
        Key: key,
      });
      await this.s3Client.send(command);
      return true;
    } catch {
      return false;
    }
  }

  async getFileMetadata(key: string): Promise<Record<string, any>> {
    try {
      const command = new HeadObjectCommand({
        Bucket: this.bucket,
        Key: key,
      });
      const result = await this.s3Client.send(command);
      return result.Metadata || {};
    } catch (error) {
      logError(error, 'S3StorageService.getFileMetadata', this.logger);
      throw error;
    }
  }

  async getFileStream(key: string): Promise<{
    stream: any;
    contentType?: string;
    contentLength?: number;
  }> {
    try {
      const command = new GetObjectCommand({
        Bucket: this.bucket,
        Key: key,
      });
      const result = await this.s3Client.send(command);

      return {
        stream: result.Body,
        contentType: result.ContentType,
        contentLength: result.ContentLength,
      };
    } catch (error) {
      logError(error, 'S3StorageService.getFileStream', this.logger);
      throw error;
    }
  }
}
