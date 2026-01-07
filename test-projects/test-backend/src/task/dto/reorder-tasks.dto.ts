import { IsArray, ValidateNested, IsInt } from 'class-validator';
import { Type } from 'class-transformer';

class TaskOrderDto {
  @IsInt()
  taskId: number;

  @IsInt()
  order: number;
}

export class ReorderTasksDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TaskOrderDto)
  tasks: TaskOrderDto[];
}
