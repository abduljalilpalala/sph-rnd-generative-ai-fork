import { Controller, Get, Post, Body, Param, Delete, Put, Query } from '@nestjs/common';
import { UserService } from './user.service';
import { SearchUserDto } from './dto/search-user.dto';

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
  search(@Query() query: SearchUserDto) {
    return this.userService.search(query);
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
