import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { PrismaService } from '../prisma/prisma.service';
import { SearchUserDto } from './dto/search-user.dto';

describe('UserService', () => {
  let service: UserService;
  let prisma: PrismaService;

  const mockPrismaService = {
    user: {
      create: jest.fn(),
      findMany: jest.fn(),
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
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a user', async () => {
      const createDto = { name: 'John Doe', email: 'john@example.com' };
      const expectedResult = { id: 1, ...createDto, createdAt: new Date(), updatedAt: new Date() };

      mockPrismaService.user.create.mockResolvedValue(expectedResult);

      const result = await service.create(createDto);

      expect(result).toEqual(expectedResult);
      expect(prisma.user.create).toHaveBeenCalledWith({ data: createDto });
      expect(prisma.user.create).toHaveBeenCalledTimes(1);
    });

    it('should throw error if email already exists', async () => {
      const createDto = { name: 'John Doe', email: 'john@example.com' };
      const error = new Error('Unique constraint violation');

      mockPrismaService.user.create.mockRejectedValue(error);

      await expect(service.create(createDto)).rejects.toThrow(error);
    });
  });

  describe('search', () => {
    it('should return users matching name filter', async () => {
      const searchDto: SearchUserDto = { name: 'John' };
      const expectedResult = [
        { id: 1, name: 'John Doe', email: 'john@example.com', createdAt: new Date(), updatedAt: new Date() },
      ];

      mockPrismaService.user.findMany.mockResolvedValue(expectedResult);

      const result = await service.search(searchDto);

      expect(result).toEqual(expectedResult);
      expect(prisma.user.findMany).toHaveBeenCalledWith({
        where: {
          name: {
            contains: 'John',
            mode: 'insensitive',
          },
        },
        skip: 0,
        take: 10,
        orderBy: {
          createdAt: 'desc',
        },
      });
    });

    it('should return users matching email filter', async () => {
      const searchDto: SearchUserDto = { email: 'example.com' };
      const expectedResult = [
        { id: 1, name: 'John Doe', email: 'john@example.com', createdAt: new Date(), updatedAt: new Date() },
      ];

      mockPrismaService.user.findMany.mockResolvedValue(expectedResult);

      const result = await service.search(searchDto);

      expect(result).toEqual(expectedResult);
      expect(prisma.user.findMany).toHaveBeenCalledWith({
        where: {
          email: {
            contains: 'example.com',
            mode: 'insensitive',
          },
        },
        skip: 0,
        take: 10,
        orderBy: {
          createdAt: 'desc',
        },
      });
    });

    it('should return users matching both name and email filters', async () => {
      const searchDto: SearchUserDto = { name: 'John', email: 'john' };
      const expectedResult = [
        { id: 1, name: 'John Doe', email: 'john@example.com', createdAt: new Date(), updatedAt: new Date() },
      ];

      mockPrismaService.user.findMany.mockResolvedValue(expectedResult);

      const result = await service.search(searchDto);

      expect(result).toEqual(expectedResult);
      expect(prisma.user.findMany).toHaveBeenCalledWith({
        where: {
          name: {
            contains: 'John',
            mode: 'insensitive',
          },
          email: {
            contains: 'john',
            mode: 'insensitive',
          },
        },
        skip: 0,
        take: 10,
        orderBy: {
          createdAt: 'desc',
        },
      });
    });

    it('should handle pagination correctly', async () => {
      const searchDto: SearchUserDto = { page: 2, limit: 5 };
      const expectedResult = [
        { id: 6, name: 'User 6', email: 'user6@example.com', createdAt: new Date(), updatedAt: new Date() },
      ];

      mockPrismaService.user.findMany.mockResolvedValue(expectedResult);

      const result = await service.search(searchDto);

      expect(result).toEqual(expectedResult);
      expect(prisma.user.findMany).toHaveBeenCalledWith({
        where: {},
        skip: 5,
        take: 5,
        orderBy: {
          createdAt: 'desc',
        },
      });
    });

    it('should use default pagination values when not provided', async () => {
      const searchDto: SearchUserDto = {};
      const expectedResult = [
        { id: 1, name: 'John Doe', email: 'john@example.com', createdAt: new Date(), updatedAt: new Date() },
      ];

      mockPrismaService.user.findMany.mockResolvedValue(expectedResult);

      const result = await service.search(searchDto);

      expect(result).toEqual(expectedResult);
      expect(prisma.user.findMany).toHaveBeenCalledWith({
        where: {},
        skip: 0,
        take: 10,
        orderBy: {
          createdAt: 'desc',
        },
      });
    });

    it('should return empty array when no users match', async () => {
      const searchDto: SearchUserDto = { name: 'NonExistent' };

      mockPrismaService.user.findMany.mockResolvedValue([]);

      const result = await service.search(searchDto);

      expect(result).toEqual([]);
      expect(prisma.user.findMany).toHaveBeenCalledTimes(1);
    });

    it('should perform case-insensitive search', async () => {
      const searchDto: SearchUserDto = { name: 'JOHN' };
      const expectedResult = [
        { id: 1, name: 'John Doe', email: 'john@example.com', createdAt: new Date(), updatedAt: new Date() },
      ];

      mockPrismaService.user.findMany.mockResolvedValue(expectedResult);

      const result = await service.search(searchDto);

      expect(result).toEqual(expectedResult);
      expect(prisma.user.findMany).toHaveBeenCalledWith({
        where: {
          name: {
            contains: 'JOHN',
            mode: 'insensitive',
          },
        },
        skip: 0,
        take: 10,
        orderBy: {
          createdAt: 'desc',
        },
      });
    });
  });

  describe('findAll', () => {
    it('should return all users', async () => {
      const expectedResult = [
        { id: 1, name: 'John Doe', email: 'john@example.com', createdAt: new Date(), updatedAt: new Date() },
        { id: 2, name: 'Jane Doe', email: 'jane@example.com', createdAt: new Date(), updatedAt: new Date() },
      ];

      mockPrismaService.user.findMany.mockResolvedValue(expectedResult);

      const result = await service.findAll();

      expect(result).toEqual(expectedResult);
      expect(prisma.user.findMany).toHaveBeenCalledTimes(1);
    });
  });

  describe('findOne', () => {
    it('should return a user by id', async () => {
      const expectedResult = { id: 1, name: 'John Doe', email: 'john@example.com', createdAt: new Date(), updatedAt: new Date() };

      mockPrismaService.user.findUnique.mockResolvedValue(expectedResult);

      const result = await service.findOne(1);

      expect(result).toEqual(expectedResult);
      expect(prisma.user.findUnique).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(prisma.user.findUnique).toHaveBeenCalledTimes(1);
    });

    it('should return null when user not found', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      const result = await service.findOne(999);

      expect(result).toBeNull();
      expect(prisma.user.findUnique).toHaveBeenCalledWith({ where: { id: 999 } });
    });
  });

  describe('update', () => {
    it('should update a user', async () => {
      const updateDto = { name: 'Jane Doe', email: 'jane@example.com' };
      const expectedResult = { id: 1, ...updateDto, createdAt: new Date(), updatedAt: new Date() };

      mockPrismaService.user.update.mockResolvedValue(expectedResult);

      const result = await service.update(1, updateDto);

      expect(result).toEqual(expectedResult);
      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: updateDto,
      });
      expect(prisma.user.update).toHaveBeenCalledTimes(1);
    });

    it('should throw error when user not found', async () => {
      const updateDto = { name: 'Jane Doe' };
      const error = new Error('Record not found');

      mockPrismaService.user.update.mockRejectedValue(error);

      await expect(service.update(999, updateDto)).rejects.toThrow(error);
    });
  });

  describe('remove', () => {
    it('should remove a user', async () => {
      const expectedResult = { id: 1, name: 'John Doe', email: 'john@example.com', createdAt: new Date(), updatedAt: new Date() };

      mockPrismaService.user.delete.mockResolvedValue(expectedResult);

      const result = await service.remove(1);

      expect(result).toEqual(expectedResult);
      expect(prisma.user.delete).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(prisma.user.delete).toHaveBeenCalledTimes(1);
    });

    it('should throw error when user not found', async () => {
      const error = new Error('Record not found');

      mockPrismaService.user.delete.mockRejectedValue(error);

      await expect(service.remove(999)).rejects.toThrow(error);
    });
  });
});
