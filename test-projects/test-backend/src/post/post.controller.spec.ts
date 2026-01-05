import { Test, TestingModule } from '@nestjs/testing';
import { PostController } from './post.controller';
import { PostService } from './post.service';
import { UserRole } from '@prisma/client';

describe('PostController', () => {
  let controller: PostController;
  let service: PostService;

  const mockPostService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    findByAuthor: jest.fn(),
  };

  const mockUser = {
    id: 1,
    email: 'test@example.com',
    role: UserRole.USER,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PostController],
      providers: [
        {
          provide: PostService,
          useValue: mockPostService,
        },
      ],
    }).compile();

    controller = module.get<PostController>(PostController);
    service = module.get<PostService>(PostService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a post', async () => {
      const createDto = { title: 'Test Post', content: 'Test content' };
      const expectedPost = { id: 1, ...createDto, authorId: mockUser.id };

      (service.create as jest.Mock).mockResolvedValue(expectedPost);

      const result = await controller.create(createDto, mockUser as any);

      expect(result).toEqual(expectedPost);
      expect(service.create).toHaveBeenCalledWith({
        ...createDto,
        authorId: mockUser.id,
      });
    });
  });

  describe('findAll', () => {
    it('should return all posts', async () => {
      const expectedPosts = [
        { id: 1, title: 'Post 1', content: 'Content 1', authorId: 1 },
      ];

      (service.findAll as jest.Mock).mockResolvedValue(expectedPosts);

      const result = await controller.findAll();

      expect(result).toEqual(expectedPosts);
      expect(service.findAll).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a post by id', async () => {
      const expectedPost = { id: 1, title: 'Test Post', content: 'Test content', authorId: 1 };

      (service.findOne as jest.Mock).mockResolvedValue(expectedPost);

      const result = await controller.findOne('1');

      expect(result).toEqual(expectedPost);
      expect(service.findOne).toHaveBeenCalledWith(1);
    });
  });

  describe('update', () => {
    it('should update a post', async () => {
      const updateDto = { title: 'Updated Title' };
      const expectedPost = { id: 1, title: 'Updated Title', content: 'Test content', authorId: 1 };

      (service.update as jest.Mock).mockResolvedValue(expectedPost);

      const result = await controller.update('1', updateDto, mockUser as any);

      expect(result).toEqual(expectedPost);
      expect(service.update).toHaveBeenCalledWith(1, updateDto, mockUser.id, mockUser.role);
    });
  });

  describe('remove', () => {
    it('should delete a post', async () => {
      const expectedPost = { id: 1, title: 'Test Post', content: 'Test content', authorId: 1 };

      (service.remove as jest.Mock).mockResolvedValue(expectedPost);

      const result = await controller.remove('1', mockUser as any);

      expect(result).toEqual(expectedPost);
      expect(service.remove).toHaveBeenCalledWith(1, mockUser.id, mockUser.role);
    });
  });

  describe('findByAuthor', () => {
    it('should return posts by author', async () => {
      const expectedPosts = [
        { id: 1, title: 'Post 1', content: 'Content 1', authorId: 1 },
      ];

      (service.findByAuthor as jest.Mock).mockResolvedValue(expectedPosts);

      const result = await controller.findByAuthor('1');

      expect(result).toEqual(expectedPosts);
      expect(service.findByAuthor).toHaveBeenCalledWith(1);
    });
  });
});
