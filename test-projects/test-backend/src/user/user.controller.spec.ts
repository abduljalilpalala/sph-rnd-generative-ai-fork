import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { UserService } from './user.service';

describe('UserController', () => {
  let controller: UserController;
  let service: UserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        {
          provide: UserService,
          useValue: {
            findAll: jest.fn(),
            findOne: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            remove: jest.fn(),
            search: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<UserController>(UserController);
    service = module.get<UserService>(UserService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('search', () => {
    it('should return users matching search criteria', async () => {
      const users = [
        { id: 1, email: 'john@example.com', name: 'John Doe', createdAt: new Date(), updatedAt: new Date() },
        { id: 2, email: 'jane@example.com', name: 'Jane Doe', createdAt: new Date(), updatedAt: new Date() },
      ];
      jest.spyOn(service, 'search').mockResolvedValue(users);

      const query = { name: 'Doe', email: 'example.com', page: 1, limit: 10 };
      const result = await controller.search(query);

      expect(result).toBe(users);
      expect(service.search).toHaveBeenCalledWith(query);
    });

    it('should call service with query parameters', async () => {
      const users = [
        { id: 1, email: 'test@example.com', name: 'Test', createdAt: new Date(), updatedAt: new Date() },
      ];
      jest.spyOn(service, 'search').mockResolvedValue(users);

      const query = { name: 'Test' };
      await controller.search(query);

      expect(service.search).toHaveBeenCalledWith(query);
    });

    it('should handle empty query parameters', async () => {
      const users = [
        { id: 1, email: 'user1@example.com', name: 'User 1', createdAt: new Date(), updatedAt: new Date() },
      ];
      jest.spyOn(service, 'search').mockResolvedValue(users);

      const query = {};
      await controller.search(query);

      expect(service.search).toHaveBeenCalledWith(query);
    });

    it('should handle pagination parameters', async () => {
      const users = [
        { id: 11, email: 'user11@example.com', name: 'User 11', createdAt: new Date(), updatedAt: new Date() },
      ];
      jest.spyOn(service, 'search').mockResolvedValue(users);

      const query = { page: 2, limit: 5 };
      await controller.search(query);

      expect(service.search).toHaveBeenCalledWith(query);
    });

    it('should return empty array when no users match', async () => {
      jest.spyOn(service, 'search').mockResolvedValue([]);

      const query = { name: 'nonexistent' };
      const result = await controller.search(query);

      expect(result).toEqual([]);
    });
  });
});
