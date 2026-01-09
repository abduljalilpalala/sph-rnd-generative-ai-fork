import {
  Controller,
  Post,
  Get,
  Delete,
  Param,
  Query,
  UseInterceptors,
  UploadedFile,
  UploadedFiles,
  Body,
  HttpStatus,
  ParseFilePipeBuilder,
  BadRequestException,
  ParseIntPipe,
  Res,
  StreamableFile,
} from '@nestjs/common';
import { Response } from 'express';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { FileService } from './file.service';
import { FileQueryDto } from './dto/file-query.dto';
import { UploadMetadataDto } from './dto/upload-metadata.dto';
import { BatchDeleteDto } from './dto/batch-delete.dto';

@Controller('files')
export class FileController {
  constructor(private readonly fileService: FileService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(
    @UploadedFile(
      new ParseFilePipeBuilder()
        .addFileTypeValidator({
          fileType: /(jpg|jpeg|png|gif|pdf|doc|docx|txt)$/,
        })
        .addMaxSizeValidator({
          maxSize: 10 * 1024 * 1024,
        })
        .build({
          errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
        }),
    )
    file: Express.Multer.File,
    @Body() metadata: UploadMetadataDto,
  ) {
    return this.fileService.uploadFile(file, metadata);
  }

  @Post('upload/batch')
  @UseInterceptors(FilesInterceptor('files', 1000))
  async uploadBatch(
    @UploadedFiles(
      new ParseFilePipeBuilder()
        .addFileTypeValidator({
          fileType: /(jpg|jpeg|png|gif|pdf|doc|docx|txt)$/,
        })
        .addMaxSizeValidator({
          maxSize: 10 * 1024 * 1024,
        })
        .build({
          errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
        }),
    )
    files: Array<Express.Multer.File>,
    @Body() metadata: UploadMetadataDto,
  ) {
    if (files.length > 1000) {
      throw new BadRequestException('Maximum 1000 files allowed per batch');
    }
    return this.fileService.uploadBatch(files, metadata);
  }

  @Get()
  async findAll(@Query() query: FileQueryDto) {
    return this.fileService.findAll(query);
  }

  @Get('batch/:batchId/progress')
  async getBatchProgress(@Param('batchId') batchId: string) {
    return this.fileService.getBatchProgress(batchId);
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.fileService.findOne(id);
  }

  @Get(':id/download-url')
  async getDownloadUrl(@Param('id', ParseIntPipe) id: number) {
    return this.fileService.getDownloadUrl(id);
  }

  @Get(':id/download')
  async downloadFile(
    @Param('id', ParseIntPipe) id: number,
    @Res({ passthrough: true }) res: Response,
  ): Promise<StreamableFile> {
    const { stream, filename, contentType, contentLength } =
      await this.fileService.downloadFile(id);

    res.set({
      'Content-Type': contentType || 'application/octet-stream',
      'Content-Disposition': `attachment; filename="${filename}"`,
      ...(contentLength && { 'Content-Length': contentLength }),
    });

    return new StreamableFile(stream);
  }

  @Delete(':id')
  async remove(
    @Param('id', ParseIntPipe) id: number,
    @Query('userId', ParseIntPipe) userId: number,
  ) {
    return this.fileService.remove(id, userId);
  }

  @Delete('batch')
  async removeBatch(@Body() body: BatchDeleteDto) {
    return this.fileService.removeBatch(body.fileIds, body.userId);
  }
}
