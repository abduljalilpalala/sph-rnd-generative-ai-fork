import { IsInt } from 'class-validator';
import { Type } from 'class-transformer';

export class UploadMetadataDto {
  @IsInt()
  @Type(() => Number)
  userId: number;
}
