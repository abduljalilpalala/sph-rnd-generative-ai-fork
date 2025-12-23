import { Controller, Get, Post, Body, Param, Delete, Put } from '@nestjs/common';
import { RoleService } from './role.service';

@Controller('roles')
export class RoleController {
  constructor(private readonly roleService: RoleService) {}

  @Post()
  create(@Body() body: { name: string; description?: string }) {
    return this.roleService.create(body);
  }

  @Get()
  findAll() {
    return this.roleService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.roleService.findOne(+id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() body: { name?: string; description?: string }) {
    return this.roleService.update(+id, body);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.roleService.remove(+id);
  }
}
