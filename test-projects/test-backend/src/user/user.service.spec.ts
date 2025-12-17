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

    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('search', () => {
    it('should return paginated users with default pagination', async () => {
      // Arrange
      const mockUsers = [
        { id: 1, email: 'test1@example.com', name: 'Test User 1', createdAt: new Date(), updatedAt: new Date() },
        { id: 2, email: 'test2@example.com', name: 'Test User 2', createdAt: new Date(), updatedAt: new Date() },
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

    it('should filter users by name (case-insensitive)', async () => {
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
        where: { name: { contains: 'john', mode: 'insensitive' } },
        skip: 0,
        take: 10,
        orderBy: { createdAt: 'desc' },
      });
    });

    it('should filter users by email (case-insensitive)', async () => {
      // Arrange
      const mockUsers = [
        { id: 1, email: 'test@example.com', name: 'Test User', createdAt: new Date(), updatedAt: new Date() },
      ];
      (prisma.user.findMany as jest.Mock).mockResolvedValue(mockUsers);
      (prisma.user.count as jest.Mock).mockResolvedValue(1);

      // Act
      const result = await service.search({ email: 'test@' });

      // Assert
      expect(result.data).toEqual(mockUsers);
      expect(prisma.user.findMany).toHaveBeenCalledWith({
        where: { email: { contains: 'test@', mode: 'insensitive' } },
        skip: 0,
        take: 10,
        orderBy: { createdAt: 'desc' },
      });
    });

    it('should filter users by both name and email', async () => {
      // Arrange
      const mockUsers = [
        { id: 1, email: 'john@example.com', name: 'John Doe', createdAt: new Date(), updatedAt: new Date() },
      ];
      (prisma.user.findMany as jest.Mock).mockResolvedValue(mockUsers);
      (prisma.user.count as jest.Mock).mockResolvedValue(1);

      // Act
      const result = await service.search({ name: 'john', email: 'example.com' });

      // Assert
      expect(result.data).toEqual(mockUsers);
      expect(prisma.user.findMany).toHaveBeenCalledWith({
        where: {
          name: { contains: 'john', mode: 'insensitive' },
          email: { contains: 'example.com', mode: 'insensitive' },
        },
        skip: 0,
        take: 10,
        orderBy: { createdAt: 'desc' },
      });
    });

    it('should handle custom pagination parameters', async () => {
      // Arrange
      const mockUsers = [
        { id: 6, email: 'user6@example.com', name: 'User 6', createdAt: new Date(), updatedAt: new Date() },
        { id: 7, email: 'user7@example.com', name: 'User 7', createdAt: new Date(), updatedAt: new Date() },
      ];
      (prisma.user.findMany as jest.Mock).mockResolvedValue(mockUsers);
      (prisma.user.count as jest.Mock).mockResolvedValue(20);

      // Act
      const result = await service.search({ page: 2, limit: 5 });

      // Assert
      expect(result).toEqual({
        data: mockUsers,
        total: 20,
        page: 2,
        limit: 5,
      });
      expect(prisma.user.findMany).toHaveBeenCalledWith({
        where: {},
        skip: 5,
        take: 5,
        orderBy: { createdAt: 'desc' },
      });
    });

    it('should return empty array when no users match', async () => {
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

    it('should handle pagination at page 3', async () => {
      // Arrange
      const mockUsers = [
        { id: 21, email: 'user21@example.com', name: 'User 21', createdAt: new Date(), updatedAt: new Date() },
      ];
      (prisma.user.findMany as jest.Mock).mockResolvedValue(mockUsers);
      (prisma.user.count as jest.Mock).mockResolvedValue(25);

      // Act
      const result = await service.search({ page: 3, limit: 10 });

      // Assert
      expect(result.page).toBe(3);
      expect(prisma.user.findMany).toHaveBeenCalledWith({
        where: {},
        skip: 20,
        take: 10,
        orderBy: { createdAt: 'desc' },
      });
    });
  });
});
