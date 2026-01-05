import { Test, TestingModule } from '@nestjs/testing';
import { PostService } from './post.service';
import { PrismaService } from '../prisma/prisma.service';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { UserRole } from '@prisma/client';

describe('PostService', () => {
  let service: PostService;
  let prisma: PrismaService;

  const mockPrismaService = {
    post: {
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
        PostService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<PostService>(PostService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a post', async () => {
      const createDto = {
        title: 'Test Post',
        content: 'Test content',
        authorId: 1,
      };
      const expectedPost = {
        id: 1,
        ...createDto,
        createdAt: new Date(),
        updatedAt: new Date(),
        author: { id: 1, name: 'Test User', email: 'test@example.com', role: UserRole.USER },
      };

      (prisma.post.create as jest.Mock).mockResolvedValue(expectedPost);

      const result = await service.create(createDto);

      expect(result).toEqual(expectedPost);
      expect(prisma.post.create).toHaveBeenCalledWith({
        data: createDto,
        include: { author: true },
      });
    });
  });

  describe('findAll', () => {
    it('should return all posts', async () => {
      const expectedPosts = [
        {
          id: 1,
          title: 'Post 1',
          content: 'Content 1',
          authorId: 1,
          author: { id: 1, name: 'User 1', email: 'user1@example.com', role: UserRole.USER },
          _count: { reports: 0 },
        },
      ];

      (prisma.post.findMany as jest.Mock).mockResolvedValue(expectedPosts);

      const result = await service.findAll();

      expect(result).toEqual(expectedPosts);
      expect(prisma.post.findMany).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a post by id', async () => {
      const expectedPost = {
        id: 1,
        title: 'Test Post',
        content: 'Test content',
        authorId: 1,
        author: { id: 1, name: 'Test User', email: 'test@example.com', role: UserRole.USER },
        _count: { reports: 0 },
      };

      (prisma.post.findUnique as jest.Mock).mockResolvedValue(expectedPost);

      const result = await service.findOne(1);

      expect(result).toEqual(expectedPost);
      expect(prisma.post.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
        include: {
          author: { select: { id: true, name: true, email: true, role: true } },
          _count: { select: { reports: true } },
        },
      });
    });
  });

  describe('update', () => {
    it('should allow author to update their own post', async () => {
      const post = {
        id: 1,
        title: 'Old Title',
        content: 'Old content',
        authorId: 1,
        author: { id: 1, name: 'Test User', email: 'test@example.com', role: UserRole.USER },
        _count: { reports: 0 },
      };
      const updatedPost = { ...post, title: 'New Title' };

      (prisma.post.findUnique as jest.Mock).mockResolvedValue(post);
      (prisma.post.update as jest.Mock).mockResolvedValue(updatedPost);

      const result = await service.update(1, { title: 'New Title' }, 1, UserRole.USER);

      expect(result).toEqual(updatedPost);
    });

    it('should throw ForbiddenException when user tries to update another user\'s post', async () => {
      const post = {
        id: 1,
        title: 'Old Title',
        content: 'Old content',
        authorId: 1,
        author: { id: 1, name: 'Test User', email: 'test@example.com', role: UserRole.USER },
        _count: { reports: 0 },
      };

      (prisma.post.findUnique as jest.Mock).mockResolvedValue(post);

      await expect(
        service.update(1, { title: 'New Title' }, 2, UserRole.USER),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should allow moderator to update any post', async () => {
      const post = {
        id: 1,
        title: 'Old Title',
        content: 'Old content',
        authorId: 1,
        author: { id: 1, name: 'Test User', email: 'test@example.com', role: UserRole.USER },
        _count: { reports: 0 },
      };
      const updatedPost = { ...post, title: 'New Title' };

      (prisma.post.findUnique as jest.Mock).mockResolvedValue(post);
      (prisma.post.update as jest.Mock).mockResolvedValue(updatedPost);

      const result = await service.update(1, { title: 'New Title' }, 2, UserRole.MODERATOR);

      expect(result).toEqual(updatedPost);
    });

    it('should throw NotFoundException when post does not exist', async () => {
      (prisma.post.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(
        service.update(999, { title: 'New Title' }, 1, UserRole.USER),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should allow author to delete their own post', async () => {
      const post = {
        id: 1,
        title: 'Test Post',
        content: 'Test content',
        authorId: 1,
        author: { id: 1, name: 'Test User', email: 'test@example.com', role: UserRole.USER },
        _count: { reports: 0 },
      };

      (prisma.post.findUnique as jest.Mock).mockResolvedValue(post);
      (prisma.post.delete as jest.Mock).mockResolvedValue(post);

      const result = await service.remove(1, 1, UserRole.USER);

      expect(result).toEqual(post);
    });

    it('should throw ForbiddenException when user tries to delete another user\'s post', async () => {
      const post = {
        id: 1,
        title: 'Test Post',
        content: 'Test content',
        authorId: 1,
        author: { id: 1, name: 'Test User', email: 'test@example.com', role: UserRole.USER },
        _count: { reports: 0 },
      };

      (prisma.post.findUnique as jest.Mock).mockResolvedValue(post);

      await expect(service.remove(1, 2, UserRole.USER)).rejects.toThrow(ForbiddenException);
    });

    it('should allow admin to delete any post', async () => {
      const post = {
        id: 1,
        title: 'Test Post',
        content: 'Test content',
        authorId: 1,
        author: { id: 1, name: 'Test User', email: 'test@example.com', role: UserRole.USER },
        _count: { reports: 0 },
      };

      (prisma.post.findUnique as jest.Mock).mockResolvedValue(post);
      (prisma.post.delete as jest.Mock).mockResolvedValue(post);

      const result = await service.remove(1, 2, UserRole.ADMIN);

      expect(result).toEqual(post);
    });
  });

  describe('findByAuthor', () => {
    it('should return posts by author', async () => {
      const expectedPosts = [
        {
          id: 1,
          title: 'Post 1',
          content: 'Content 1',
          authorId: 1,
          author: { id: 1, name: 'User 1', email: 'user1@example.com', role: UserRole.USER },
        },
      ];

      (prisma.post.findMany as jest.Mock).mockResolvedValue(expectedPosts);

      const result = await service.findByAuthor(1);

      expect(result).toEqual(expectedPosts);
      expect(prisma.post.findMany).toHaveBeenCalledWith({
        where: { authorId: 1 },
        include: { author: true },
        orderBy: { createdAt: 'desc' },
      });
    });
  });
});
