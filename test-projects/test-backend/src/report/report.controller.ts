import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  UseGuards,
} from '@nestjs/common';
import { ReportService } from './report.service';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

interface UserPayload {
  id: number;
  email: string;
  role: string;
}

@Controller('reports')
@UseGuards(RolesGuard)
export class ReportController {
  constructor(private readonly reportService: ReportService) {}

  @Post()
  create(
    @Body() body: { reason: string; postId: number },
    @CurrentUser() user: UserPayload,
  ) {
    return this.reportService.create({
      ...body,
      reporterId: user.id,
    });
  }

  @Get()
  @Roles(UserRole.MODERATOR, UserRole.ADMIN)
  findAll(@CurrentUser() user: UserPayload) {
    return this.reportService.findAll(user.role as UserRole);
  }

  @Get('pending')
  @Roles(UserRole.MODERATOR, UserRole.ADMIN)
  findPending(@CurrentUser() user: UserPayload) {
    return this.reportService.findPending(user.role as UserRole);
  }

  @Get(':id')
  @Roles(UserRole.MODERATOR, UserRole.ADMIN)
  findOne(@Param('id') id: string, @CurrentUser() user: UserPayload) {
    return this.reportService.findOne(+id, user.role as UserRole);
  }

  @Patch(':id/approve')
  @Roles(UserRole.MODERATOR, UserRole.ADMIN)
  approve(@Param('id') id: string, @CurrentUser() user: UserPayload) {
    return this.reportService.approve(+id, user.id, user.role as UserRole);
  }

  @Patch(':id/reject')
  @Roles(UserRole.MODERATOR, UserRole.ADMIN)
  reject(@Param('id') id: string, @CurrentUser() user: UserPayload) {
    return this.reportService.reject(+id, user.id, user.role as UserRole);
  }
}
