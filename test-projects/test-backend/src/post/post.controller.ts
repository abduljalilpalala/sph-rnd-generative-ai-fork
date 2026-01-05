import { Controller, Get, Post, Body, Param, Delete, Put, UseGuards } from '@nestjs/common';
import { PostService } from './post.service';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { RolesGuard } from '../common/guards/roles.guard';

interface UserPayload {
  id: number;
  email: string;
  role: string;
}

@Controller('posts')
@UseGuards(RolesGuard)
export class PostController {
  constructor(private readonly postService: PostService) {}

  @Post()
  create(
    @Body() body: { title: string; content: string },
    @CurrentUser() user: UserPayload,
  ) {
    return this.postService.create({
      ...body,
      authorId: user.id,
    });
  }

  @Get()
  findAll() {
    return this.postService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.postService.findOne(+id);
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() body: { title?: string; content?: string },
    @CurrentUser() user: UserPayload,
  ) {
    return this.postService.update(+id, body, user.id, user.role as any);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser() user: UserPayload) {
    return this.postService.remove(+id, user.id, user.role as any);
  }

  @Get('author/:authorId')
  findByAuthor(@Param('authorId') authorId: string) {
    return this.postService.findByAuthor(+authorId);
  }
}
