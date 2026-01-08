import { IsOptional, IsInt, IsEnum, IsString, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { FileType } from '@prisma/client';

export class FileQueryDto {
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  userId?: number;

  @IsOptional()
  @IsEnum(FileType)
  fileType?: FileType;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsString()
  sortBy?: 'name' | 'date' | 'size';

  @IsOptional()
  @IsString()
  sortOrder?: 'asc' | 'desc';

  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  limit?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Type(() => Number)
  offset?: number;
}
