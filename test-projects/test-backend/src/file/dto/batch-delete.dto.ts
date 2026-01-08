import { IsInt, IsArray, ArrayMinSize } from 'class-validator';
import { Type } from 'class-transformer';

export class BatchDeleteDto {
  @IsArray()
  @ArrayMinSize(1)
  @IsInt({ each: true })
  fileIds: number[];

  @IsInt()
  @Type(() => Number)
  userId: number;
}
