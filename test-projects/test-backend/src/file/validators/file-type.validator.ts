import { FileValidator } from '@nestjs/common';

export interface FileTypeValidatorOptions {
  fileTypes: string[];
}

export class CustomFileTypeValidator extends FileValidator<FileTypeValidatorOptions> {
  private readonly allowedMimeTypes = new Map<string, string[]>([
    // Image types
    ['jpg', ['image/jpeg']],
    ['jpeg', ['image/jpeg']],
    ['png', ['image/png']],
    ['gif', ['image/gif']],
    ['webp', ['image/webp']],
    // Document types
    ['pdf', ['application/pdf']],
    ['doc', ['application/msword']],
    [
      'docx',
      [
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      ],
    ],
    ['txt', ['text/plain']],
    ['xls', ['application/vnd.ms-excel']],
    [
      'xlsx',
      [
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      ],
    ],
    ['ppt', ['application/vnd.ms-powerpoint']],
    [
      'pptx',
      [
        'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      ],
    ],
  ]);

  buildErrorMessage(): string {
    const allowedExtensions = this.validationOptions.fileTypes.join(', ');
    return `Invalid file type. Allowed types: ${allowedExtensions}`;
  }

  isValid(file: Express.Multer.File): boolean {
    if (!file || !file.mimetype) {
      return false;
    }

    // Get allowed MIME types based on configured file extensions
    const allowedMimeTypes: string[] = [];
    for (const fileType of this.validationOptions.fileTypes) {
      const mimeTypes = this.allowedMimeTypes.get(fileType.toLowerCase());
      if (mimeTypes) {
        allowedMimeTypes.push(...mimeTypes);
      }
    }

    // Check if the file's MIME type is in the allowed list
    return allowedMimeTypes.includes(file.mimetype);
  }
}
