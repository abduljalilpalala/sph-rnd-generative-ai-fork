import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Query,
  Param,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ProjectService } from './project.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { AddMemberDto } from './dto/add-member.dto';

@Controller('projects')
export class ProjectController {
  constructor(private readonly projectService: ProjectService) {}

  @Post()
  create(@Body() body: { userId: number } & CreateProjectDto) {
    const { userId, ...data } = body;
    return this.projectService.create(userId, data);
  }

  @Get()
  findAll(@Query('userId', ParseIntPipe) userId: number) {
    return this.projectService.findAll(userId);
  }

  @Get(':id')
  findOne(
    @Param('id', ParseIntPipe) id: number,
    @Query('userId', ParseIntPipe) userId: number,
  ) {
    return this.projectService.findOne(userId, id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { userId: number } & UpdateProjectDto,
  ) {
    const { userId, ...data } = body;
    return this.projectService.update(userId, id, data);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(
    @Param('id', ParseIntPipe) id: number,
    @Query('userId', ParseIntPipe) userId: number,
  ) {
    return this.projectService.remove(userId, id);
  }

  @Post(':id/members')
  addMember(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { userId: number } & AddMemberDto,
  ) {
    const { userId, ...data } = body;
    return this.projectService.addMember(userId, id, data);
  }

  @Get(':id/members')
  getMembers(
    @Param('id', ParseIntPipe) id: number,
    @Query('userId', ParseIntPipe) userId: number,
  ) {
    return this.projectService.getMembers(userId, id);
  }
}
