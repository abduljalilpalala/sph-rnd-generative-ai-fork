import { IsInt, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class UploadMetadataDto {
  @IsInt()
  @Type(() => Number)
  userId: number;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  projectId?: number;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  taskId?: number;
}
