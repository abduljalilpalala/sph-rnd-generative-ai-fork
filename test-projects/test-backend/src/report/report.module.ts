import { Module } from '@nestjs/common';
import { ReportController } from './report.controller';
import { ReportService } from './report.service';
import { PrismaModule } from '../prisma/prisma.module';
import { ModerationLogModule } from '../moderation-log/moderation-log.module';

@Module({
  imports: [PrismaModule, ModerationLogModule],
  controllers: [ReportController],
  providers: [ReportService],
})
export class ReportModule {}
