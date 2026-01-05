import { IsInt, IsEnum } from 'class-validator';
import { ProjectRole } from '@prisma/client';

export class AddMemberDto {
  @IsInt()
  userId: number;

  @IsEnum(ProjectRole)
  role: ProjectRole;
}
