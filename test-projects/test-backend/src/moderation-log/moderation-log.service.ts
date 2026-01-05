import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ModerationLog } from '@prisma/client';

@Injectable()
export class ModerationLogService {
  constructor(private prisma: PrismaService) {}

  async create(data: {
    action: string;
    postId: number;
    moderatorId: number;
    details?: string;
  }): Promise<ModerationLog> {
    return this.prisma.moderationLog.create({
      data,
      include: {
        moderator: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
        post: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });
  }

  async findByPost(postId: number): Promise<ModerationLog[]> {
    return this.prisma.moderationLog.findMany({
      where: { postId },
      include: {
        moderator: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findAll(): Promise<ModerationLog[]> {
    return this.prisma.moderationLog.findMany({
      include: {
        moderator: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
        post: {
          select: {
            id: true,
            title: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }
}
