import { Test, TestingModule } from '@nestjs/testing';
import { PostService } from './post.service';
import { PrismaService } from '../prisma/prisma.service';

describe('PostService', () => {
  let service: PostService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PostService,
        {
          provide: PrismaService,
          useValue: {
            post: {
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

    service = module.get<PostService>(PostService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return all posts', async () => {
      const posts = [
        { id: 1, title: 'Test Post', content: 'Test content' },
      ];
      (prisma.post.findMany as jest.Mock).mockResolvedValue(posts);

      const result = await service.findAll();
      expect(result).toEqual(posts);
      expect(prisma.post.findMany).toHaveBeenCalledTimes(1);
    });
  });

  describe('create', () => {
    it('should create a post', async () => {
      const createDto = { title: 'Test Post', content: 'Test content' };
      const post = { id: 1, ...createDto };
      (prisma.post.create as jest.Mock).mockResolvedValue(post);

      const result = await service.create(createDto);
      expect(result).toEqual(post);
      expect(prisma.post.create).toHaveBeenCalledWith({ data: createDto });
    });

    it('should throw error if post creation fails', async () => {
      const createDto = { title: 'Test Post', content: 'Test content' };
      (prisma.post.create as jest.Mock).mockRejectedValue(
        new Error('Database error'),
      );

      await expect(service.create(createDto)).rejects.toThrow();
    });
  });
});
