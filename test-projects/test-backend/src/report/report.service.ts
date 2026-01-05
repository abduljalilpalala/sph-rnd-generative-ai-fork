import {
  Injectable,
  ForbiddenException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Report, ReportStatus, UserRole } from '@prisma/client';
import { ModerationLogService } from '../moderation-log/moderation-log.service';

@Injectable()
export class ReportService {
  constructor(
    private prisma: PrismaService,
    private moderationLogService: ModerationLogService,
  ) {}

  async create(data: {
    reason: string;
    postId: number;
    reporterId: number;
  }): Promise<Report> {
    // Check if post exists
    const post = await this.prisma.post.findUnique({
      where: { id: data.postId },
    });

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    // User cannot report their own post
    if (post.authorId === data.reporterId) {
      throw new ForbiddenException('You cannot report your own post');
    }

    // Check if user has already reported this post
    const existingReport = await this.prisma.report.findUnique({
      where: {
        postId_reporterId: {
          postId: data.postId,
          reporterId: data.reporterId,
        },
      },
    });

    if (existingReport) {
      throw new BadRequestException('You have already reported this post');
    }

    return this.prisma.report.create({
      data,
      include: {
        reporter: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        post: {
          include: {
            author: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
    });
  }

  async findAll(userRole: UserRole): Promise<Report[]> {
    // Only moderators and admins can view all reports
    if (userRole === UserRole.USER) {
      throw new ForbiddenException('You do not have permission to view reports');
    }

    return this.prisma.report.findMany({
      include: {
        reporter: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        post: {
          include: {
            author: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findPending(userRole: UserRole): Promise<Report[]> {
    // Only moderators and admins can view pending reports
    if (userRole === UserRole.USER) {
      throw new ForbiddenException('You do not have permission to view reports');
    }

    return this.prisma.report.findMany({
      where: {
        status: ReportStatus.PENDING,
      },
      include: {
        reporter: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        post: {
          include: {
            author: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(id: number, userRole: UserRole): Promise<Report | null> {
    // Only moderators and admins can view report details
    if (userRole === UserRole.USER) {
      throw new ForbiddenException('You do not have permission to view reports');
    }

    return this.prisma.report.findUnique({
      where: { id },
      include: {
        reporter: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        post: {
          include: {
            author: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
    });
  }

  async approve(
    id: number,
    moderatorId: number,
    userRole: UserRole,
  ): Promise<Report> {
    // Only moderators and admins can approve reports
    if (userRole === UserRole.USER) {
      throw new ForbiddenException('You do not have permission to moderate reports');
    }

    const report = await this.prisma.report.findUnique({
      where: { id },
      include: { post: true },
    });

    if (!report) {
      throw new NotFoundException('Report not found');
    }

    // Moderators cannot moderate their own posts
    if (report.post.authorId === moderatorId) {
      throw new ForbiddenException('You cannot moderate your own post');
    }

    const updatedReport = await this.prisma.report.update({
      where: { id },
      data: {
        status: ReportStatus.APPROVED,
      },
      include: {
        reporter: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        post: {
          include: {
            author: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
    });

    // Log moderation action
    await this.moderationLogService.create({
      action: 'REPORT_APPROVED',
      postId: report.postId,
      moderatorId,
      details: `Report #${id} approved. Reason: ${report.reason}`,
    });

    return updatedReport;
  }

  async reject(
    id: number,
    moderatorId: number,
    userRole: UserRole,
  ): Promise<Report> {
    // Only moderators and admins can reject reports
    if (userRole === UserRole.USER) {
      throw new ForbiddenException('You do not have permission to moderate reports');
    }

    const report = await this.prisma.report.findUnique({
      where: { id },
      include: { post: true },
    });

    if (!report) {
      throw new NotFoundException('Report not found');
    }

    // Moderators cannot moderate their own posts
    if (report.post.authorId === moderatorId) {
      throw new ForbiddenException('You cannot moderate your own post');
    }

    const updatedReport = await this.prisma.report.update({
      where: { id },
      data: {
        status: ReportStatus.REJECTED,
      },
      include: {
        reporter: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        post: {
          include: {
            author: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
    });

    // Log moderation action
    await this.moderationLogService.create({
      action: 'REPORT_REJECTED',
      postId: report.postId,
      moderatorId,
      details: `Report #${id} rejected. Reason: ${report.reason}`,
    });

    return updatedReport;
  }
}
