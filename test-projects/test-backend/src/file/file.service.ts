import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { S3StorageService } from '../storage/s3-storage.service';
import { File, FileType, FileStatus } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';
import * as path from 'path';
import { FileQueryDto } from './dto/file-query.dto';
import { UploadMetadataDto } from './dto/upload-metadata.dto';

export interface BatchProgress {
  totalFiles: number;
  completed: number;
  failed: number;
  inProgress: number;
}

@Injectable()
export class FileService {
  private readonly logger = new Logger(FileService.name);
  private readonly batchProgressCache = new Map<string, BatchProgress>();

  constructor(
    private prisma: PrismaService,
    private storageService: S3StorageService,
  ) {}

  async uploadFile(
    file: Express.Multer.File,
    metadata: UploadMetadataDto,
  ): Promise<File> {
    const fileType = this.getFileType(file.mimetype);

    const storedName = `${uuidv4()}${path.extname(file.originalname)}`;
    const s3Key = `uploads/${metadata.userId}/${storedName}`;

    const fileRecord = await this.prisma.file.create({
      data: {
        originalName: file.originalname,
        storedName,
        s3Key,
        s3Bucket: process.env.S3_BUCKET || 'local-files',
        mimeType: file.mimetype,
        fileType,
        size: file.size,
        status: FileStatus.UPLOADING,
        uploadedById: metadata.userId,
      },
    });

    try {
      await this.storageService.upload(file.buffer, {
        key: s3Key,
        mimeType: file.mimetype,
        metadata: {
          originalName: file.originalname,
          uploadedBy: metadata.userId.toString(),
        },
      });

      // Generate URL for the uploaded file
      const url = await this.storageService.getSignedUrl(s3Key, 604800); // 7 days

      return await this.prisma.file.update({
        where: { id: fileRecord.id },
        data: {
          status: FileStatus.COMPLETED,
          url,
        },
        include: { uploadedBy: true },
      });
    } catch (error) {
      await this.prisma.file.update({
        where: { id: fileRecord.id },
        data: {
          status: FileStatus.FAILED,
          errorMessage: error.message,
        },
      });
      throw error;
    }
  }

  async uploadBatch(
    files: Array<Express.Multer.File>,
    metadata: UploadMetadataDto,
  ): Promise<{ batchId: string; totalFiles: number }> {
    const batchId = uuidv4();

    this.batchProgressCache.set(batchId, {
      totalFiles: files.length,
      completed: 0,
      failed: 0,
      inProgress: files.length,
    });

    this.processBatchUpload(batchId, files, metadata);

    return { batchId, totalFiles: files.length };
  }

  private async processBatchUpload(
    batchId: string,
    files: Array<Express.Multer.File>,
    metadata: UploadMetadataDto,
  ): Promise<void> {
    const BATCH_SIZE = 50;

    for (let i = 0; i < files.length; i += BATCH_SIZE) {
      const batch = files.slice(i, i + BATCH_SIZE);

      await Promise.allSettled(
        batch.map(async (file) => {
          try {
            await this.uploadFile(file, metadata);
            this.updateBatchProgress(batchId, 'completed');
          } catch (error) {
            this.logger.error(
              `Failed to upload file ${file.originalname}: ${error.message}`,
            );
            this.updateBatchProgress(batchId, 'failed');
          }
        }),
      );
    }
  }

  private updateBatchProgress(
    batchId: string,
    status: 'completed' | 'failed',
  ): void {
    const progress = this.batchProgressCache.get(batchId);
    if (progress) {
      progress[status]++;
      progress.inProgress--;
    }
  }

  async getBatchProgress(batchId: string): Promise<BatchProgress> {
    const progress = this.batchProgressCache.get(batchId);
    if (!progress) {
      throw new NotFoundException('Batch not found');
    }
    return progress;
  }

  async findAll(query: FileQueryDto): Promise<File[]> {
    // Build where clause
    const where: any = {
      uploadedById: query.userId,
      fileType: query.fileType,
      status: FileStatus.COMPLETED,
    };

    // Add search functionality
    if (query.search) {
      where.originalName = {
        contains: query.search,
        mode: 'insensitive',
      };
    }

    // Build orderBy clause
    let orderBy: any = { createdAt: 'desc' };
    if (query.sortBy) {
      switch (query.sortBy) {
        case 'name':
          orderBy = { originalName: query.sortOrder || 'asc' };
          break;
        case 'date':
          orderBy = { createdAt: query.sortOrder || 'desc' };
          break;
        case 'size':
          orderBy = { size: query.sortOrder || 'desc' };
          break;
      }
    }

    return this.prisma.file.findMany({
      where,
      include: {
        uploadedBy: true,
      },
      orderBy,
      take: query.limit || 100,
      skip: query.offset || 0,
    });
  }

  async findOne(id: number): Promise<File> {
    const file = await this.prisma.file.findUnique({
      where: { id },
      include: { uploadedBy: true },
    });

    if (!file) {
      throw new NotFoundException('File not found');
    }

    return file;
  }

  async getDownloadUrl(id: number): Promise<{ url: string; expiresIn: number }> {
    const file = await this.findOne(id);
    const url = await this.storageService.getSignedUrl(file.s3Key, 3600);

    return { url, expiresIn: 3600 };
  }

  async remove(id: number, userId: number): Promise<void> {
    const file = await this.findOne(id);

    if (file.uploadedById !== userId) {
      throw new ForbiddenException('You can only delete your own files');
    }

    await this.storageService.delete(file.s3Key);
    await this.prisma.file.delete({ where: { id } });
  }

  async removeBatch(
    fileIds: number[],
    userId: number,
  ): Promise<{ deleted: number }> {
    const files = await this.prisma.file.findMany({
      where: {
        id: { in: fileIds },
        uploadedById: userId,
      },
    });

    if (files.length !== fileIds.length) {
      throw new ForbiddenException('You can only delete your own files');
    }

    await this.storageService.batchDelete(files.map((f) => f.s3Key));
    await this.prisma.file.deleteMany({
      where: { id: { in: fileIds } },
    });

    return { deleted: files.length };
  }

  private getFileType(mimeType: string): FileType {
    if (mimeType.startsWith('image/')) {
      return FileType.IMAGE;
    }
    if (mimeType.startsWith('application/') || mimeType.startsWith('text/')) {
      return FileType.DOCUMENT;
    }
    throw new BadRequestException('Unsupported file type');
  }
}
