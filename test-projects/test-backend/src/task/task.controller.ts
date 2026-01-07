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
import { TaskService } from './task.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { AssignTaskDto } from './dto/assign-task.dto';
import { ReorderTasksDto } from './dto/reorder-tasks.dto';

@Controller()
export class TaskController {
  constructor(private readonly taskService: TaskService) {}

  @Post('projects/:projectId/tasks')
  create(
    @Param('projectId', ParseIntPipe) projectId: number,
    @Body() body: { userId: number } & CreateTaskDto,
  ) {
    const { userId, ...data } = body;
    return this.taskService.create(userId, projectId, data);
  }

  @Get('projects/:projectId/tasks')
  findAll(
    @Param('projectId', ParseIntPipe) projectId: number,
    @Query('userId', ParseIntPipe) userId: number,
  ) {
    return this.taskService.findAll(userId, projectId);
  }

  @Patch('tasks/:id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { userId: number } & UpdateTaskDto,
  ) {
    const { userId, ...data } = body;
    return this.taskService.update(userId, id, data);
  }

  @Delete('tasks/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseIntPipe) id: number, @Query('userId', ParseIntPipe) userId: number) {
    return this.taskService.remove(userId, id);
  }

  @Post('tasks/:id/assign')
  assignTask(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { userId: number } & AssignTaskDto,
  ) {
    const { userId, ...data } = body;
    return this.taskService.assignTask(userId, id, data);
  }

  @Post('projects/:projectId/tasks/reorder')
  @HttpCode(HttpStatus.NO_CONTENT)
  reorderTasks(
    @Param('projectId', ParseIntPipe) projectId: number,
    @Body() body: { userId: number } & ReorderTasksDto,
  ) {
    const { userId, ...data } = body;
    return this.taskService.reorderTasks(userId, projectId, data.tasks);
  }
}
