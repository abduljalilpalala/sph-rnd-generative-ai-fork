export interface StorageConfig {
  bucket: string;
  region: string;
  endpoint?: string;
}

export interface UploadResult {
  key: string;
  bucket: string;
  url: string;
  etag: string;
}

export interface UploadOptions {
  key: string;
  mimeType: string;
  metadata?: Record<string, string>;
}

export interface IStorageService {
  upload(file: Buffer, options: UploadOptions): Promise<UploadResult>;
  delete(key: string): Promise<void>;
  getSignedUrl(key: string, expiresIn?: number): Promise<string>;
  batchUpload(
    files: Array<{ buffer: Buffer; options: UploadOptions }>,
  ): Promise<UploadResult[]>;
  batchDelete(keys: string[]): Promise<void>;
  fileExists(key: string): Promise<boolean>;
  getFileMetadata(key: string): Promise<Record<string, any>>;
}
