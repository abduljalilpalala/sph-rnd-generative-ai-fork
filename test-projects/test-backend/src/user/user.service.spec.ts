import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { PrismaService } from '../prisma/prisma.service';

describe('UserService', () => {
  let service: UserService;
  let prisma: PrismaService;

  const mockPrismaService = {
    user: {
      findMany: jest.fn(),
      count: jest.fn(),
      create: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
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

    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('search', () => {
    const mockUsers = [
      { id: 1, email: 'john@example.com', name: 'John Doe', createdAt: new Date(), updatedAt: new Date() },
      { id: 2, email: 'jane@example.com', name: 'Jane Smith', createdAt: new Date(), updatedAt: new Date() },
    ];

    it('should search users by name', async () => {
      // Arrange
      mockPrismaService.user.findMany.mockResolvedValue(mockUsers);
      mockPrismaService.user.count.mockResolvedValue(2);

      // Act
      const result = await service.search({ name: 'John' });

      // Assert
      expect(result).toEqual({
        users: mockUsers,
        total: 2,
        page: 1,
        limit: 10,
      });
      expect(prisma.user.findMany).toHaveBeenCalledWith({
        where: {
          name: {
            contains: 'John',
            mode: 'insensitive',
          },
        },
        skip: 0,
        take: 10,
        orderBy: { createdAt: 'desc' },
      });
      expect(prisma.user.count).toHaveBeenCalledWith({
        where: {
          name: {
            contains: 'John',
            mode: 'insensitive',
          },
        },
      });
    });

    it('should search users by email', async () => {
      // Arrange
      mockPrismaService.user.findMany.mockResolvedValue([mockUsers[0]]);
      mockPrismaService.user.count.mockResolvedValue(1);

      // Act
      const result = await service.search({ email: 'john@example' });

      // Assert
      expect(result).toEqual({
        users: [mockUsers[0]],
        total: 1,
        page: 1,
        limit: 10,
      });
      expect(prisma.user.findMany).toHaveBeenCalledWith({
        where: {
          email: {
            contains: 'john@example',
            mode: 'insensitive',
          },
        },
        skip: 0,
        take: 10,
        orderBy: { createdAt: 'desc' },
      });
    });

    it('should search users by both name and email', async () => {
      // Arrange
      mockPrismaService.user.findMany.mockResolvedValue([mockUsers[0]]);
      mockPrismaService.user.count.mockResolvedValue(1);

      // Act
      const result = await service.search({ name: 'John', email: 'example.com' });

      // Assert
      expect(result).toEqual({
        users: [mockUsers[0]],
        total: 1,
        page: 1,
        limit: 10,
      });
      expect(prisma.user.findMany).toHaveBeenCalledWith({
        where: {
          name: {
            contains: 'John',
            mode: 'insensitive',
          },
          email: {
            contains: 'example.com',
            mode: 'insensitive',
          },
        },
        skip: 0,
        take: 10,
        orderBy: { createdAt: 'desc' },
      });
    });

    it('should apply pagination correctly', async () => {
      // Arrange
      mockPrismaService.user.findMany.mockResolvedValue([mockUsers[1]]);
      mockPrismaService.user.count.mockResolvedValue(2);

      // Act
      const result = await service.search({ page: 2, limit: 1 });

      // Assert
      expect(result).toEqual({
        users: [mockUsers[1]],
        total: 2,
        page: 2,
        limit: 1,
      });
      expect(prisma.user.findMany).toHaveBeenCalledWith({
        where: {},
        skip: 1,
        take: 1,
        orderBy: { createdAt: 'desc' },
      });
    });

    it('should return all users when no filters are provided', async () => {
      // Arrange
      mockPrismaService.user.findMany.mockResolvedValue(mockUsers);
      mockPrismaService.user.count.mockResolvedValue(2);

      // Act
      const result = await service.search({});

      // Assert
      expect(result).toEqual({
        users: mockUsers,
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
    });

    it('should return empty array when no users match', async () => {
      // Arrange
      mockPrismaService.user.findMany.mockResolvedValue([]);
      mockPrismaService.user.count.mockResolvedValue(0);

      // Act
      const result = await service.search({ name: 'NonExistent' });

      // Assert
      expect(result).toEqual({
        users: [],
        total: 0,
        page: 1,
        limit: 10,
      });
    });

    it('should use default pagination values when not provided', async () => {
      // Arrange
      mockPrismaService.user.findMany.mockResolvedValue(mockUsers);
      mockPrismaService.user.count.mockResolvedValue(2);

      // Act
      const result = await service.search({ name: 'John' });

      // Assert
      expect(result.page).toBe(1);
      expect(result.limit).toBe(10);
      expect(prisma.user.findMany).toHaveBeenCalledWith({
        where: {
          name: {
            contains: 'John',
            mode: 'insensitive',
          },
        },
        skip: 0,
        take: 10,
        orderBy: { createdAt: 'desc' },
      });
    });
  });
});
