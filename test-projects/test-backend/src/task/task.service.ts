import {
  Injectable,
  Logger,
  NotFoundException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Task, TaskAssignment } from '@prisma/client';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { AssignTaskDto } from './dto/assign-task.dto';
import { logError } from '../common/utils/error-handler.util';

@Injectable()
export class TaskService {
  private readonly logger = new Logger(TaskService.name);

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
      orderBy: [
        {
          order: 'asc',
        },
        {
          createdAt: 'desc',
        },
      ],
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
    await this.verifyProjectMembership(data.assigneeUserId, task.projectId);

    const existingAssignment = await this.prisma.taskAssignment.findFirst({
      where: {
        taskId: taskId,
        userId: data.assigneeUserId,
      },
    });

    if (existingAssignment) {
      throw new ConflictException('User is already assigned to this task');
    }

    return this.prisma.taskAssignment.create({
      data: {
        taskId: taskId,
        userId: data.assigneeUserId,
      },
      include: {
        user: true,
        task: true,
      },
    });
  }

  async reorderTasks(
    userId: number,
    projectId: number,
    taskOrders: { taskId: number; order: number }[],
  ): Promise<void> {
    await this.verifyProjectMembership(userId, projectId);

    try {
      // Update all tasks in a transaction
      await this.prisma.$transaction(
        taskOrders.map((taskOrder) =>
          this.prisma.task.update({
            where: { id: taskOrder.taskId },
            data: { order: taskOrder.order },
          }),
        ),
      );
    } catch (error) {
      logError(error, 'TaskService.reorderTasks', this.logger);
      throw error;
    }
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
