import { Controller, Get, Post, Body, Param, Delete, Put, Patch, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

interface UserPayload {
  id: number;
  email: string;
  role: string;
}

@Controller('users')
@UseGuards(RolesGuard)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  create(@Body() body: { name: string; email: string }) {
    return this.userService.create(body);
  }

  @Get()
  findAll() {
    return this.userService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.userService.findOne(+id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() body: { name?: string; email?: string }) {
    return this.userService.update(+id, body);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.userService.remove(+id);
  }

  @Patch(':id/role')
  @Roles(UserRole.ADMIN)
  updateRole(
    @Param('id') id: string,
    @Body() body: { role: UserRole },
    @CurrentUser() user: UserPayload,
  ) {
    return this.userService.updateRole(+id, body.role, user.role as UserRole);
  }
}
