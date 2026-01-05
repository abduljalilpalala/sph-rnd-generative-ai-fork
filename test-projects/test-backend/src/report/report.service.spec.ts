import { Test, TestingModule } from '@nestjs/testing';
import { ReportService } from './report.service';
import { PrismaService } from '../prisma/prisma.service';
import { ModerationLogService } from '../moderation-log/moderation-log.service';
import {
  ForbiddenException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { UserRole, ReportStatus } from '@prisma/client';

describe('ReportService', () => {
  let service: ReportService;
  let prisma: PrismaService;
  let moderationLogService: ModerationLogService;

  const mockPrismaService = {
    post: {
      findUnique: jest.fn(),
    },
    report: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
    },
  };

  const mockModerationLogService = {
    create: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReportService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: ModerationLogService,
          useValue: mockModerationLogService,
        },
      ],
    }).compile();

    service = module.get<ReportService>(ReportService);
    prisma = module.get<PrismaService>(PrismaService);
    moderationLogService = module.get<ModerationLogService>(ModerationLogService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a report', async () => {
      const createDto = { reason: 'Spam', postId: 1, reporterId: 2 };
      const post = { id: 1, title: 'Test Post', authorId: 3 };
      const expectedReport = {
        id: 1,
        ...createDto,
        status: ReportStatus.PENDING,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (prisma.post.findUnique as jest.Mock).mockResolvedValue(post);
      (prisma.report.findUnique as jest.Mock).mockResolvedValue(null);
      (prisma.report.create as jest.Mock).mockResolvedValue(expectedReport);

      const result = await service.create(createDto);

      expect(result).toEqual(expectedReport);
      expect(prisma.report.create).toHaveBeenCalled();
    });

    it('should throw NotFoundException if post does not exist', async () => {
      const createDto = { reason: 'Spam', postId: 999, reporterId: 2 };

      (prisma.post.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(service.create(createDto)).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException if user reports their own post', async () => {
      const createDto = { reason: 'Spam', postId: 1, reporterId: 1 };
      const post = { id: 1, title: 'Test Post', authorId: 1 };

      (prisma.post.findUnique as jest.Mock).mockResolvedValue(post);

      await expect(service.create(createDto)).rejects.toThrow(ForbiddenException);
    });

    it('should throw BadRequestException if user already reported the post', async () => {
      const createDto = { reason: 'Spam', postId: 1, reporterId: 2 };
      const post = { id: 1, title: 'Test Post', authorId: 3 };
      const existingReport = { id: 1, postId: 1, reporterId: 2 };

      (prisma.post.findUnique as jest.Mock).mockResolvedValue(post);
      (prisma.report.findUnique as jest.Mock).mockResolvedValue(existingReport);

      await expect(service.create(createDto)).rejects.toThrow(BadRequestException);
    });
  });

  describe('findAll', () => {
    it('should return all reports for moderator', async () => {
      const expectedReports = [
        { id: 1, reason: 'Spam', postId: 1, reporterId: 2, status: ReportStatus.PENDING },
      ];

      (prisma.report.findMany as jest.Mock).mockResolvedValue(expectedReports);

      const result = await service.findAll(UserRole.MODERATOR);

      expect(result).toEqual(expectedReports);
    });

    it('should throw ForbiddenException for regular users', async () => {
      await expect(service.findAll(UserRole.USER)).rejects.toThrow(ForbiddenException);
    });
  });

  describe('approve', () => {
    it('should approve a report', async () => {
      const report = {
        id: 1,
        reason: 'Spam',
        postId: 1,
        reporterId: 2,
        status: ReportStatus.PENDING,
        post: { id: 1, title: 'Test Post', authorId: 3 },
      };
      const approvedReport = { ...report, status: ReportStatus.APPROVED };

      (prisma.report.findUnique as jest.Mock).mockResolvedValue(report);
      (prisma.report.update as jest.Mock).mockResolvedValue(approvedReport);

      const result = await service.approve(1, 4, UserRole.MODERATOR);

      expect(result).toEqual(approvedReport);
      expect(moderationLogService.create).toHaveBeenCalled();
    });

    it('should throw ForbiddenException if moderator tries to moderate their own post', async () => {
      const report = {
        id: 1,
        reason: 'Spam',
        postId: 1,
        reporterId: 2,
        status: ReportStatus.PENDING,
        post: { id: 1, title: 'Test Post', authorId: 3 },
      };

      (prisma.report.findUnique as jest.Mock).mockResolvedValue(report);

      await expect(service.approve(1, 3, UserRole.MODERATOR)).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('should throw ForbiddenException for regular users', async () => {
      await expect(service.approve(1, 1, UserRole.USER)).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  describe('reject', () => {
    it('should reject a report', async () => {
      const report = {
        id: 1,
        reason: 'Spam',
        postId: 1,
        reporterId: 2,
        status: ReportStatus.PENDING,
        post: { id: 1, title: 'Test Post', authorId: 3 },
      };
      const rejectedReport = { ...report, status: ReportStatus.REJECTED };

      (prisma.report.findUnique as jest.Mock).mockResolvedValue(report);
      (prisma.report.update as jest.Mock).mockResolvedValue(rejectedReport);

      const result = await service.reject(1, 4, UserRole.MODERATOR);

      expect(result).toEqual(rejectedReport);
      expect(moderationLogService.create).toHaveBeenCalled();
    });

    it('should throw ForbiddenException if moderator tries to moderate their own post', async () => {
      const report = {
        id: 1,
        reason: 'Spam',
        postId: 1,
        reporterId: 2,
        status: ReportStatus.PENDING,
        post: { id: 1, title: 'Test Post', authorId: 3 },
      };

      (prisma.report.findUnique as jest.Mock).mockResolvedValue(report);

      await expect(service.reject(1, 3, UserRole.MODERATOR)).rejects.toThrow(
        ForbiddenException,
      );
    });
  });
});
