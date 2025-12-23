import { Test, TestingModule } from '@nestjs/testing';
import { PostController } from './post.controller';
import { PostService } from './post.service';

describe('PostController', () => {
  let controller: PostController;
  let service: PostService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PostController],
      providers: [
        {
          provide: PostService,
          useValue: {
            findAll: jest.fn(),
            findOne: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            remove: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<PostController>(PostController);
    service = module.get<PostService>(PostService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should return an array of posts', async () => {
      const result = [
        { id: 1, title: 'Test Post', content: 'Test content' },
      ];
      jest.spyOn(service, 'findAll').mockResolvedValue(result as any);

      expect(await controller.findAll()).toBe(result);
    });
  });

  describe('create', () => {
    it('should create a post', async () => {
      const createDto = { title: 'Test Post', content: 'Test content' };
      const result = { id: 1, ...createDto };
      jest.spyOn(service, 'create').mockResolvedValue(result as any);

      expect(await controller.create(createDto)).toBe(result);
    });
  });
});
