import { Test, TestingModule } from '@nestjs/testing';
import { ReportController } from './report.controller';
import { ReportService } from './report.service';
import { UserRole, ReportStatus } from '@prisma/client';

describe('ReportController', () => {
  let controller: ReportController;
  let service: ReportService;

  const mockReportService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findPending: jest.fn(),
    findOne: jest.fn(),
    approve: jest.fn(),
    reject: jest.fn(),
  };

  const mockUser = {
    id: 1,
    email: 'moderator@example.com',
    role: UserRole.MODERATOR,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ReportController],
      providers: [
        {
          provide: ReportService,
          useValue: mockReportService,
        },
      ],
    }).compile();

    controller = module.get<ReportController>(ReportController);
    service = module.get<ReportService>(ReportService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a report', async () => {
      const createDto = { reason: 'Spam', postId: 1 };
      const expectedReport = {
        id: 1,
        ...createDto,
        reporterId: mockUser.id,
        status: ReportStatus.PENDING,
      };

      (service.create as jest.Mock).mockResolvedValue(expectedReport);

      const result = await controller.create(createDto, mockUser as any);

      expect(result).toEqual(expectedReport);
      expect(service.create).toHaveBeenCalledWith({
        ...createDto,
        reporterId: mockUser.id,
      });
    });
  });

  describe('findAll', () => {
    it('should return all reports', async () => {
      const expectedReports = [
        { id: 1, reason: 'Spam', postId: 1, reporterId: 2, status: ReportStatus.PENDING },
      ];

      (service.findAll as jest.Mock).mockResolvedValue(expectedReports);

      const result = await controller.findAll(mockUser as any);

      expect(result).toEqual(expectedReports);
      expect(service.findAll).toHaveBeenCalledWith(UserRole.MODERATOR);
    });
  });

  describe('findPending', () => {
    it('should return pending reports', async () => {
      const expectedReports = [
        { id: 1, reason: 'Spam', postId: 1, reporterId: 2, status: ReportStatus.PENDING },
      ];

      (service.findPending as jest.Mock).mockResolvedValue(expectedReports);

      const result = await controller.findPending(mockUser as any);

      expect(result).toEqual(expectedReports);
      expect(service.findPending).toHaveBeenCalledWith(UserRole.MODERATOR);
    });
  });

  describe('findOne', () => {
    it('should return a report by id', async () => {
      const expectedReport = {
        id: 1,
        reason: 'Spam',
        postId: 1,
        reporterId: 2,
        status: ReportStatus.PENDING,
      };

      (service.findOne as jest.Mock).mockResolvedValue(expectedReport);

      const result = await controller.findOne('1', mockUser as any);

      expect(result).toEqual(expectedReport);
      expect(service.findOne).toHaveBeenCalledWith(1, UserRole.MODERATOR);
    });
  });

  describe('approve', () => {
    it('should approve a report', async () => {
      const expectedReport = {
        id: 1,
        reason: 'Spam',
        postId: 1,
        reporterId: 2,
        status: ReportStatus.APPROVED,
      };

      (service.approve as jest.Mock).mockResolvedValue(expectedReport);

      const result = await controller.approve('1', mockUser as any);

      expect(result).toEqual(expectedReport);
      expect(service.approve).toHaveBeenCalledWith(1, mockUser.id, UserRole.MODERATOR);
    });
  });

  describe('reject', () => {
    it('should reject a report', async () => {
      const expectedReport = {
        id: 1,
        reason: 'Spam',
        postId: 1,
        reporterId: 2,
        status: ReportStatus.REJECTED,
      };

      (service.reject as jest.Mock).mockResolvedValue(expectedReport);

      const result = await controller.reject('1', mockUser as any);

      expect(result).toEqual(expectedReport);
      expect(service.reject).toHaveBeenCalledWith(1, mockUser.id, UserRole.MODERATOR);
    });
  });
});
