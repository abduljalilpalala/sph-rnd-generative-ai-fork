import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { SearchUserDto } from './dto/search-user.dto';

describe('UserController', () => {
  let controller: UserController;
  let service: UserService;

  const mockUserService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    search: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        {
          provide: UserService,
          useValue: mockUserService,
        },
      ],
    }).compile();

    controller = module.get<UserController>(UserController);
    service = module.get<UserService>(UserService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('search', () => {
    it('should return paginated users', async () => {
      const searchResult = {
        data: [
          { id: 1, email: 'john@example.com', name: 'John Doe', createdAt: new Date(), updatedAt: new Date() },
          { id: 2, email: 'jane@example.com', name: 'Jane Smith', createdAt: new Date(), updatedAt: new Date() },
        ],
        total: 2,
        page: 1,
        limit: 10,
      };

      (service.search as jest.Mock).mockResolvedValue(searchResult);

      const searchDto: SearchUserDto = {};
      const result = await controller.search(searchDto);

      expect(result).toEqual(searchResult);
      expect(service.search).toHaveBeenCalledWith(searchDto);
      expect(service.search).toHaveBeenCalledTimes(1);
    });

    it('should filter users by name', async () => {
      const searchResult = {
        data: [
          { id: 1, email: 'john@example.com', name: 'John Doe', createdAt: new Date(), updatedAt: new Date() },
        ],
        total: 1,
        page: 1,
        limit: 10,
      };

      (service.search as jest.Mock).mockResolvedValue(searchResult);

      const searchDto: SearchUserDto = { name: 'John' };
      const result = await controller.search(searchDto);

      expect(result).toEqual(searchResult);
      expect(service.search).toHaveBeenCalledWith(searchDto);
    });

    it('should filter users by email', async () => {
      const searchResult = {
        data: [
          { id: 1, email: 'john@example.com', name: 'John Doe', createdAt: new Date(), updatedAt: new Date() },
        ],
        total: 1,
        page: 1,
        limit: 10,
      };

      (service.search as jest.Mock).mockResolvedValue(searchResult);

      const searchDto: SearchUserDto = { email: 'john@example' };
      const result = await controller.search(searchDto);

      expect(result).toEqual(searchResult);
      expect(service.search).toHaveBeenCalledWith(searchDto);
    });

    it('should filter users by both name and email', async () => {
      const searchResult = {
        data: [
          { id: 1, email: 'john@example.com', name: 'John Doe', createdAt: new Date(), updatedAt: new Date() },
        ],
        total: 1,
        page: 1,
        limit: 10,
      };

      (service.search as jest.Mock).mockResolvedValue(searchResult);

      const searchDto: SearchUserDto = { name: 'John', email: 'example' };
      const result = await controller.search(searchDto);

      expect(result).toEqual(searchResult);
      expect(service.search).toHaveBeenCalledWith(searchDto);
    });

    it('should handle pagination parameters', async () => {
      const searchResult = {
        data: [
          { id: 3, email: 'user3@example.com', name: 'User 3', createdAt: new Date(), updatedAt: new Date() },
        ],
        total: 20,
        page: 2,
        limit: 5,
      };

      (service.search as jest.Mock).mockResolvedValue(searchResult);

      const searchDto: SearchUserDto = { page: 2, limit: 5 };
      const result = await controller.search(searchDto);

      expect(result).toEqual(searchResult);
      expect(service.search).toHaveBeenCalledWith(searchDto);
    });

    it('should return empty result when no users match', async () => {
      const searchResult = {
        data: [],
        total: 0,
        page: 1,
        limit: 10,
      };

      (service.search as jest.Mock).mockResolvedValue(searchResult);

      const searchDto: SearchUserDto = { name: 'NonExistent' };
      const result = await controller.search(searchDto);

      expect(result).toEqual(searchResult);
      expect(service.search).toHaveBeenCalledWith(searchDto);
    });
  });
});
