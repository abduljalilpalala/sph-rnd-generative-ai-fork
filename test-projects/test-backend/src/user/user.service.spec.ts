import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { PrismaService } from '../prisma/prisma.service';

describe('UserService', () => {
  let service: UserService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: PrismaService,
          useValue: {
            user: {
              findMany: jest.fn(),
              findUnique: jest.fn(),
              create: jest.fn(),
              update: jest.fn(),
              delete: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('search', () => {
    it('should return users matching name filter', async () => {
      const users = [
        { id: 1, email: 'john@example.com', name: 'John Doe', createdAt: new Date(), updatedAt: new Date() },
        { id: 2, email: 'jane@example.com', name: 'Jane Doe', createdAt: new Date(), updatedAt: new Date() },
      ];
      (prisma.user.findMany as jest.Mock).mockResolvedValue(users);

      const result = await service.search({ name: 'Doe' });

      expect(result).toEqual(users);
      expect(prisma.user.findMany).toHaveBeenCalledWith({
        where: {
          name: {
            contains: 'Doe',
            mode: 'insensitive',
          },
        },
        skip: 0,
        take: 10,
      });
    });

    it('should return users matching email filter', async () => {
      const users = [
        { id: 1, email: 'test@example.com', name: 'Test User', createdAt: new Date(), updatedAt: new Date() },
      ];
      (prisma.user.findMany as jest.Mock).mockResolvedValue(users);

      const result = await service.search({ email: 'example.com' });

      expect(result).toEqual(users);
      expect(prisma.user.findMany).toHaveBeenCalledWith({
        where: {
          email: {
            contains: 'example.com',
            mode: 'insensitive',
          },
        },
        skip: 0,
        take: 10,
      });
    });

    it('should return users matching both name and email filters', async () => {
      const users = [
        { id: 1, email: 'john@example.com', name: 'John Doe', createdAt: new Date(), updatedAt: new Date() },
      ];
      (prisma.user.findMany as jest.Mock).mockResolvedValue(users);

      const result = await service.search({ name: 'John', email: 'example.com' });

      expect(result).toEqual(users);
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
      });
    });

    it('should return all users when no filters provided', async () => {
      const users = [
        { id: 1, email: 'user1@example.com', name: 'User 1', createdAt: new Date(), updatedAt: new Date() },
        { id: 2, email: 'user2@example.com', name: 'User 2', createdAt: new Date(), updatedAt: new Date() },
      ];
      (prisma.user.findMany as jest.Mock).mockResolvedValue(users);

      const result = await service.search({});

      expect(result).toEqual(users);
      expect(prisma.user.findMany).toHaveBeenCalledWith({
        where: {},
        skip: 0,
        take: 10,
      });
    });

    it('should apply pagination with custom page and limit', async () => {
      const users = [
        { id: 11, email: 'user11@example.com', name: 'User 11', createdAt: new Date(), updatedAt: new Date() },
      ];
      (prisma.user.findMany as jest.Mock).mockResolvedValue(users);

      const result = await service.search({ page: 2, limit: 5 });

      expect(result).toEqual(users);
      expect(prisma.user.findMany).toHaveBeenCalledWith({
        where: {},
        skip: 5,
        take: 5,
      });
    });

    it('should use default pagination when not provided', async () => {
      const users = [
        { id: 1, email: 'user@example.com', name: 'User', createdAt: new Date(), updatedAt: new Date() },
      ];
      (prisma.user.findMany as jest.Mock).mockResolvedValue(users);

      await service.search({});

      expect(prisma.user.findMany).toHaveBeenCalledWith({
        where: {},
        skip: 0,
        take: 10,
      });
    });

    it('should handle page 1 correctly', async () => {
      const users = [
        { id: 1, email: 'user@example.com', name: 'User', createdAt: new Date(), updatedAt: new Date() },
      ];
      (prisma.user.findMany as jest.Mock).mockResolvedValue(users);

      await service.search({ page: 1, limit: 20 });

      expect(prisma.user.findMany).toHaveBeenCalledWith({
        where: {},
        skip: 0,
        take: 20,
      });
    });

    it('should return empty array when no users match', async () => {
      (prisma.user.findMany as jest.Mock).mockResolvedValue([]);

      const result = await service.search({ name: 'nonexistent' });

      expect(result).toEqual([]);
    });
  });
});
