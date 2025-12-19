import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { PrismaService } from '../prisma/prisma.service';

describe('UserService', () => {
  let service: UserService;
  let prisma: PrismaService;

  const mockPrismaService = {
    user: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('search', () => {
    it('should return paginated users with default pagination', async () => {
      // Arrange
      const mockUsers = [
        { id: 1, email: 'test1@example.com', name: 'Test One', createdAt: new Date(), updatedAt: new Date() },
        { id: 2, email: 'test2@example.com', name: 'Test Two', createdAt: new Date(), updatedAt: new Date() },
      ];
      (prisma.user.findMany as jest.Mock).mockResolvedValue(mockUsers);
      (prisma.user.count as jest.Mock).mockResolvedValue(2);

      // Act
      const result = await service.search({});

      // Assert
      expect(result).toEqual({
        data: mockUsers,
        total: 2,
        page: 1,
        limit: 10,
      });
      expect(prisma.user.findMany).toHaveBeenCalledWith({
        where: {},
        skip: 0,
        take: 10,
        orderBy: { createdAt: 'desc' },
      });
      expect(prisma.user.count).toHaveBeenCalledWith({ where: {} });
    });

    it('should filter by name (case-insensitive)', async () => {
      // Arrange
      const mockUsers = [
        { id: 1, email: 'john@example.com', name: 'John Doe', createdAt: new Date(), updatedAt: new Date() },
      ];
      (prisma.user.findMany as jest.Mock).mockResolvedValue(mockUsers);
      (prisma.user.count as jest.Mock).mockResolvedValue(1);

      // Act
      const result = await service.search({ name: 'john' });

      // Assert
      expect(result.data).toEqual(mockUsers);
      expect(result.total).toBe(1);
      expect(prisma.user.findMany).toHaveBeenCalledWith({
        where: {
          AND: [
            {
              name: {
                contains: 'john',
                mode: 'insensitive',
              },
            },
          ],
        },
        skip: 0,
        take: 10,
        orderBy: { createdAt: 'desc' },
      });
    });

    it('should filter by email (case-insensitive)', async () => {
      // Arrange
      const mockUsers = [
        { id: 1, email: 'john@example.com', name: 'John Doe', createdAt: new Date(), updatedAt: new Date() },
      ];
      (prisma.user.findMany as jest.Mock).mockResolvedValue(mockUsers);
      (prisma.user.count as jest.Mock).mockResolvedValue(1);

      // Act
      const result = await service.search({ email: 'john@' });

      // Assert
      expect(result.data).toEqual(mockUsers);
      expect(result.total).toBe(1);
      expect(prisma.user.findMany).toHaveBeenCalledWith({
        where: {
          AND: [
            {
              email: {
                contains: 'john@',
                mode: 'insensitive',
              },
            },
          ],
        },
        skip: 0,
        take: 10,
        orderBy: { createdAt: 'desc' },
      });
    });

    it('should filter by both name and email using AND logic', async () => {
      // Arrange
      const mockUsers = [
        { id: 1, email: 'john@example.com', name: 'John Doe', createdAt: new Date(), updatedAt: new Date() },
      ];
      (prisma.user.findMany as jest.Mock).mockResolvedValue(mockUsers);
      (prisma.user.count as jest.Mock).mockResolvedValue(1);

      // Act
      const result = await service.search({ name: 'john', email: 'example' });

      // Assert
      expect(result.data).toEqual(mockUsers);
      expect(result.total).toBe(1);
      expect(prisma.user.findMany).toHaveBeenCalledWith({
        where: {
          AND: [
            {
              name: {
                contains: 'john',
                mode: 'insensitive',
              },
            },
            {
              email: {
                contains: 'example',
                mode: 'insensitive',
              },
            },
          ],
        },
        skip: 0,
        take: 10,
        orderBy: { createdAt: 'desc' },
      });
    });

    it('should handle custom pagination - page 2 with limit 5', async () => {
      // Arrange
      const mockUsers = [
        { id: 6, email: 'test6@example.com', name: 'Test Six', createdAt: new Date(), updatedAt: new Date() },
        { id: 7, email: 'test7@example.com', name: 'Test Seven', createdAt: new Date(), updatedAt: new Date() },
      ];
      (prisma.user.findMany as jest.Mock).mockResolvedValue(mockUsers);
      (prisma.user.count as jest.Mock).mockResolvedValue(15);

      // Act
      const result = await service.search({ page: 2, limit: 5 });

      // Assert
      expect(result).toEqual({
        data: mockUsers,
        total: 15,
        page: 2,
        limit: 5,
      });
      expect(prisma.user.findMany).toHaveBeenCalledWith({
        where: {},
        skip: 5, // (2 - 1) * 5
        take: 5,
        orderBy: { createdAt: 'desc' },
      });
    });

    it('should return empty array when no users match filters', async () => {
      // Arrange
      (prisma.user.findMany as jest.Mock).mockResolvedValue([]);
      (prisma.user.count as jest.Mock).mockResolvedValue(0);

      // Act
      const result = await service.search({ name: 'nonexistent' });

      // Assert
      expect(result).toEqual({
        data: [],
        total: 0,
        page: 1,
        limit: 10,
      });
    });

    it('should handle page 1 correctly', async () => {
      // Arrange
      const mockUsers = [
        { id: 1, email: 'test1@example.com', name: 'Test One', createdAt: new Date(), updatedAt: new Date() },
      ];
      (prisma.user.findMany as jest.Mock).mockResolvedValue(mockUsers);
      (prisma.user.count as jest.Mock).mockResolvedValue(1);

      // Act
      const result = await service.search({ page: 1, limit: 10 });

      // Assert
      expect(prisma.user.findMany).toHaveBeenCalledWith({
        where: {},
        skip: 0, // (1 - 1) * 10 = 0
        take: 10,
        orderBy: { createdAt: 'desc' },
      });
    });
  });
});
