import { Module } from '@nestjs/common';
import { S3StorageService } from './s3-storage.service';

@Module({
  providers: [
    {
      provide: S3StorageService,
      useFactory: () => {
        return new S3StorageService({
          bucket: process.env.S3_BUCKET || 'local-files',
          region: process.env.S3_REGION || 'us-east-1',
          endpoint: process.env.S3_ENDPOINT || 'http://localhost:4566',
        });
      },
    },
  ],
  exports: [S3StorageService],
})
export class StorageModule {}
