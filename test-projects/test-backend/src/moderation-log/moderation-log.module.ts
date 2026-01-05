import { Module } from '@nestjs/common';
import { ModerationLogService } from './moderation-log.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [ModerationLogService],
  exports: [ModerationLogService],
})
export class ModerationLogModule {}
