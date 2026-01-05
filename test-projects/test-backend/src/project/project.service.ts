import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Project, ProjectMember, ProjectRole } from '@prisma/client';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { AddMemberDto } from './dto/add-member.dto';

@Injectable()
export class ProjectService {
  constructor(private prisma: PrismaService) {}

  async create(userId: number, data: CreateProjectDto): Promise<Project> {
    const project = await this.prisma.project.create({
      data: {
        name: data.name,
        description: data.description,
        ownerId: userId,
        members: {
          create: {
            userId: userId,
            role: ProjectRole.OWNER,
          },
        },
      },
      include: {
        owner: true,
        members: {
          include: {
            user: true,
          },
        },
      },
    });

    return project;
  }

  async findAll(userId: number): Promise<Project[]> {
    return this.prisma.project.findMany({
      where: {
        members: {
          some: {
            userId: userId,
          },
        },
      },
      include: {
        owner: true,
        members: {
          include: {
            user: true,
          },
        },
        _count: {
          select: {
            tasks: true,
          },
        },
      },
    });
  }

  async findOne(userId: number, projectId: number): Promise<Project> {
    const project = await this.prisma.project.findFirst({
      where: {
        id: projectId,
        members: {
          some: {
            userId: userId,
          },
        },
      },
      include: {
        owner: true,
        members: {
          include: {
            user: true,
          },
        },
        tasks: {
          include: {
            createdBy: true,
            assignments: {
              include: {
                user: true,
              },
            },
          },
        },
      },
    });

    if (!project) {
      throw new NotFoundException('Project not found or access denied');
    }

    return project;
  }

  async update(
    userId: number,
    projectId: number,
    data: UpdateProjectDto,
  ): Promise<Project> {
    await this.verifyOwnership(userId, projectId);

    return this.prisma.project.update({
      where: { id: projectId },
      data,
      include: {
        owner: true,
        members: {
          include: {
            user: true,
          },
        },
      },
    });
  }

  async remove(userId: number, projectId: number): Promise<void> {
    await this.verifyOwnership(userId, projectId);

    await this.prisma.project.delete({
      where: { id: projectId },
    });
  }

  async addMember(
    userId: number,
    projectId: number,
    data: AddMemberDto,
  ): Promise<ProjectMember> {
    await this.verifyOwnership(userId, projectId);

    const existingMember = await this.prisma.projectMember.findFirst({
      where: {
        userId: data.userId,
        projectId: projectId,
      },
    });

    if (existingMember) {
      throw new ConflictException('User is already a member of this project');
    }

    return this.prisma.projectMember.create({
      data: {
        userId: data.userId,
        projectId: projectId,
        role: data.role,
      },
      include: {
        user: true,
        project: true,
      },
    });
  }

  async getMembers(userId: number, projectId: number): Promise<ProjectMember[]> {
    await this.verifyMembership(userId, projectId);

    return this.prisma.projectMember.findMany({
      where: {
        projectId: projectId,
      },
      include: {
        user: true,
      },
    });
  }

  private async verifyOwnership(
    userId: number,
    projectId: number,
  ): Promise<void> {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    if (project.ownerId !== userId) {
      throw new ForbiddenException('Only the project owner can perform this action');
    }
  }

  private async verifyMembership(
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
