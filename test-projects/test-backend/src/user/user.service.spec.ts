import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { PrismaService } from '../prisma/prisma.service';
import { SearchUserDto } from './dto/search-user.dto';

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

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('search', () => {
    it('should return paginated users with default pagination', async () => {
      const users = [
        { id: 1, email: 'john@example.com', name: 'John Doe', createdAt: new Date(), updatedAt: new Date() },
        { id: 2, email: 'jane@example.com', name: 'Jane Smith', createdAt: new Date(), updatedAt: new Date() },
      ];

      (prisma.user.findMany as jest.Mock).mockResolvedValue(users);
      (prisma.user.count as jest.Mock).mockResolvedValue(2);

      const searchDto: SearchUserDto = {};
      const result = await service.search(searchDto);

      expect(result).toEqual({
        data: users,
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

    it('should filter users by name', async () => {
      const users = [
        { id: 1, email: 'john@example.com', name: 'John Doe', createdAt: new Date(), updatedAt: new Date() },
      ];

      (prisma.user.findMany as jest.Mock).mockResolvedValue(users);
      (prisma.user.count as jest.Mock).mockResolvedValue(1);

      const searchDto: SearchUserDto = { name: 'John' };
      const result = await service.search(searchDto);

      expect(result.data).toEqual(users);
      expect(result.total).toBe(1);
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

    it('should filter users by email', async () => {
      const users = [
        { id: 1, email: 'john@example.com', name: 'John Doe', createdAt: new Date(), updatedAt: new Date() },
      ];

      (prisma.user.findMany as jest.Mock).mockResolvedValue(users);
      (prisma.user.count as jest.Mock).mockResolvedValue(1);

      const searchDto: SearchUserDto = { email: 'john@example' };
      const result = await service.search(searchDto);

      expect(result.data).toEqual(users);
      expect(result.total).toBe(1);
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

    it('should filter users by both name and email', async () => {
      const users = [
        { id: 1, email: 'john@example.com', name: 'John Doe', createdAt: new Date(), updatedAt: new Date() },
      ];

      (prisma.user.findMany as jest.Mock).mockResolvedValue(users);
      (prisma.user.count as jest.Mock).mockResolvedValue(1);

      const searchDto: SearchUserDto = { name: 'John', email: 'example.com' };
      const result = await service.search(searchDto);

      expect(result.data).toEqual(users);
      expect(result.total).toBe(1);
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

    it('should handle pagination with custom page and limit', async () => {
      const users = [
        { id: 3, email: 'user3@example.com', name: 'User 3', createdAt: new Date(), updatedAt: new Date() },
        { id: 4, email: 'user4@example.com', name: 'User 4', createdAt: new Date(), updatedAt: new Date() },
      ];

      (prisma.user.findMany as jest.Mock).mockResolvedValue(users);
      (prisma.user.count as jest.Mock).mockResolvedValue(20);

      const searchDto: SearchUserDto = { page: 2, limit: 5 };
      const result = await service.search(searchDto);

      expect(result).toEqual({
        data: users,
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
      (prisma.user.findMany as jest.Mock).mockResolvedValue([]);
      (prisma.user.count as jest.Mock).mockResolvedValue(0);

      const searchDto: SearchUserDto = { name: 'NonExistent' };
      const result = await service.search(searchDto);

      expect(result).toEqual({
        data: [],
        total: 0,
        page: 1,
        limit: 10,
      });
    });

    it('should handle case-insensitive search', async () => {
      const users = [
        { id: 1, email: 'JOHN@EXAMPLE.COM', name: 'JOHN DOE', createdAt: new Date(), updatedAt: new Date() },
      ];

      (prisma.user.findMany as jest.Mock).mockResolvedValue(users);
      (prisma.user.count as jest.Mock).mockResolvedValue(1);

      const searchDto: SearchUserDto = { name: 'john', email: 'example' };
      const result = await service.search(searchDto);

      expect(result.data).toEqual(users);
      expect(prisma.user.findMany).toHaveBeenCalledWith({
        where: {
          name: {
            contains: 'john',
            mode: 'insensitive',
          },
          email: {
            contains: 'example',
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
