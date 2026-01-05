import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Task, TaskAssignment } from '@prisma/client';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { AssignTaskDto } from './dto/assign-task.dto';

@Injectable()
export class TaskService {
  constructor(private prisma: PrismaService) {}

  async create(
    userId: number,
    projectId: number,
    data: CreateTaskDto,
  ): Promise<Task> {
    await this.verifyProjectMembership(userId, projectId);

    return this.prisma.task.create({
      data: {
        title: data.title,
        description: data.description,
        status: data.status,
        projectId: projectId,
        createdById: userId,
      },
      include: {
        createdBy: true,
        project: true,
        assignments: {
          include: {
            user: true,
          },
        },
      },
    });
  }

  async findAll(userId: number, projectId: number): Promise<Task[]> {
    await this.verifyProjectMembership(userId, projectId);

    return this.prisma.task.findMany({
      where: {
        projectId: projectId,
      },
      include: {
        createdBy: true,
        assignments: {
          include: {
            user: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async update(userId: number, taskId: number, data: UpdateTaskDto): Promise<Task> {
    const task = await this.prisma.task.findUnique({
      where: { id: taskId },
    });

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    await this.verifyProjectMembership(userId, task.projectId);

    return this.prisma.task.update({
      where: { id: taskId },
      data,
      include: {
        createdBy: true,
        project: true,
        assignments: {
          include: {
            user: true,
          },
        },
      },
    });
  }

  async remove(userId: number, taskId: number): Promise<void> {
    const task = await this.prisma.task.findUnique({
      where: { id: taskId },
    });

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    await this.verifyProjectMembership(userId, task.projectId);

    await this.prisma.task.delete({
      where: { id: taskId },
    });
  }

  async assignTask(
    userId: number,
    taskId: number,
    data: AssignTaskDto,
  ): Promise<TaskAssignment> {
    const task = await this.prisma.task.findUnique({
      where: { id: taskId },
    });

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    await this.verifyProjectMembership(userId, task.projectId);
    await this.verifyProjectMembership(data.userId, task.projectId);

    const existingAssignment = await this.prisma.taskAssignment.findFirst({
      where: {
        taskId: taskId,
        userId: data.userId,
      },
    });

    if (existingAssignment) {
      throw new ConflictException('User is already assigned to this task');
    }

    return this.prisma.taskAssignment.create({
      data: {
        taskId: taskId,
        userId: data.userId,
      },
      include: {
        user: true,
        task: true,
      },
    });
  }

  private async verifyProjectMembership(
    userId: number,
    projectId: number,
  ): Promise<void> {
    const member = await this.prisma.projectMember.findFirst({
      where: {
        userId: userId,
        projectId: projectId,
      },
    });

    if (!member) {
      throw new ForbiddenException('Access denied');
    }
  }
}
