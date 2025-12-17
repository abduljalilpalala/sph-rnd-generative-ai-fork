import { Controller, Get, Post, Body, Param, Delete, Put, Query } from '@nestjs/common';
import { UserService } from './user.service';

@Controller('users')
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

  @Get('search')
  search(
    @Query('name') name?: string,
    @Query('email') email?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.userService.search({
      name,
      email,
      page: page ? parseInt(page, 10) : undefined,
      limit: limit ? parseInt(limit, 10) : undefined,
    });
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
}
