import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { UserService } from './user.service';

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

    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('search', () => {
    it('should call service.search with correct parameters', async () => {
      // Arrange
      const mockResult = {
        data: [
          { id: 1, email: 'test@example.com', name: 'Test User', createdAt: new Date(), updatedAt: new Date() },
        ],
        total: 1,
        page: 1,
        limit: 10,
      };
      (service.search as jest.Mock).mockResolvedValue(mockResult);

      // Act
      const result = await controller.search('test', 'test@example.com', '1', '10');

      // Assert
      expect(result).toBe(mockResult);
      expect(service.search).toHaveBeenCalledWith({
        name: 'test',
        email: 'test@example.com',
        page: 1,
        limit: 10,
      });
    });

    it('should call service.search with undefined parameters when not provided', async () => {
      // Arrange
      const mockResult = {
        data: [],
        total: 0,
        page: 1,
        limit: 10,
      };
      (service.search as jest.Mock).mockResolvedValue(mockResult);

      // Act
      const result = await controller.search();

      // Assert
      expect(result).toBe(mockResult);
      expect(service.search).toHaveBeenCalledWith({
        name: undefined,
        email: undefined,
        page: undefined,
        limit: undefined,
      });
    });

    it('should parse page and limit as integers', async () => {
      // Arrange
      const mockResult = {
        data: [],
        total: 0,
        page: 2,
        limit: 5,
      };
      (service.search as jest.Mock).mockResolvedValue(mockResult);

      // Act
      await controller.search(undefined, undefined, '2', '5');

      // Assert
      expect(service.search).toHaveBeenCalledWith({
        name: undefined,
        email: undefined,
        page: 2,
        limit: 5,
      });
    });

    it('should handle only name parameter', async () => {
      // Arrange
      const mockResult = {
        data: [
          { id: 1, email: 'john@example.com', name: 'John Doe', createdAt: new Date(), updatedAt: new Date() },
        ],
        total: 1,
        page: 1,
        limit: 10,
      };
      (service.search as jest.Mock).mockResolvedValue(mockResult);

      // Act
      await controller.search('john');

      // Assert
      expect(service.search).toHaveBeenCalledWith({
        name: 'john',
        email: undefined,
        page: undefined,
        limit: undefined,
      });
    });

    it('should handle only email parameter', async () => {
      // Arrange
      const mockResult = {
        data: [
          { id: 1, email: 'test@example.com', name: 'Test User', createdAt: new Date(), updatedAt: new Date() },
        ],
        total: 1,
        page: 1,
        limit: 10,
      };
      (service.search as jest.Mock).mockResolvedValue(mockResult);

      // Act
      await controller.search(undefined, 'test@example.com');

      // Assert
      expect(service.search).toHaveBeenCalledWith({
        name: undefined,
        email: 'test@example.com',
        page: undefined,
        limit: undefined,
      });
    });

    it('should return the search result from service', async () => {
      // Arrange
      const mockUsers = [
        { id: 1, email: 'user1@example.com', name: 'User 1', createdAt: new Date(), updatedAt: new Date() },
        { id: 2, email: 'user2@example.com', name: 'User 2', createdAt: new Date(), updatedAt: new Date() },
      ];
      const mockResult = {
        data: mockUsers,
        total: 2,
        page: 1,
        limit: 10,
      };
      (service.search as jest.Mock).mockResolvedValue(mockResult);

      // Act
      const result = await controller.search();

      // Assert
      expect(result).toEqual(mockResult);
      expect(result.data).toHaveLength(2);
      expect(result.total).toBe(2);
    });
  });
});
