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
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('search', () => {
    it('should return search results with metadata', async () => {
      // Arrange
      const mockResult = {
        data: [
          { id: 1, email: 'test@example.com', name: 'Test User', createdAt: new Date(), updatedAt: new Date() },
        ],
        total: 1,
        page: 1,
        limit: 10,
      };
      jest.spyOn(service, 'search').mockResolvedValue(mockResult);

      // Act
      const result = await controller.search({});

      // Assert
      expect(result).toEqual(mockResult);
      expect(service.search).toHaveBeenCalledWith({});
    });

    it('should pass query parameters to service', async () => {
      // Arrange
      const searchDto = { name: 'john', email: 'example', page: 2, limit: 5 };
      const mockResult = {
        data: [],
        total: 0,
        page: 2,
        limit: 5,
      };
      jest.spyOn(service, 'search').mockResolvedValue(mockResult);

      // Act
      await controller.search(searchDto);

      // Assert
      expect(service.search).toHaveBeenCalledWith(searchDto);
    });

    it('should handle empty query parameters', async () => {
      // Arrange
      const mockResult = {
        data: [
          { id: 1, email: 'test1@example.com', name: 'Test One', createdAt: new Date(), updatedAt: new Date() },
          { id: 2, email: 'test2@example.com', name: 'Test Two', createdAt: new Date(), updatedAt: new Date() },
        ],
        total: 2,
        page: 1,
        limit: 10,
      };
      jest.spyOn(service, 'search').mockResolvedValue(mockResult);

      // Act
      const result = await controller.search({});

      // Assert
      expect(result.data.length).toBe(2);
      expect(result.total).toBe(2);
      expect(service.search).toHaveBeenCalledWith({});
    });

    it('should handle search with name filter only', async () => {
      // Arrange
      const searchDto = { name: 'john' };
      const mockResult = {
        data: [
          { id: 1, email: 'john@example.com', name: 'John Doe', createdAt: new Date(), updatedAt: new Date() },
        ],
        total: 1,
        page: 1,
        limit: 10,
      };
      jest.spyOn(service, 'search').mockResolvedValue(mockResult);

      // Act
      const result = await controller.search(searchDto);

      // Assert
      expect(result).toEqual(mockResult);
      expect(service.search).toHaveBeenCalledWith(searchDto);
    });

    it('should handle search with email filter only', async () => {
      // Arrange
      const searchDto = { email: 'example.com' };
      const mockResult = {
        data: [
          { id: 1, email: 'test@example.com', name: 'Test', createdAt: new Date(), updatedAt: new Date() },
        ],
        total: 1,
        page: 1,
        limit: 10,
      };
      jest.spyOn(service, 'search').mockResolvedValue(mockResult);

      // Act
      const result = await controller.search(searchDto);

      // Assert
      expect(result).toEqual(mockResult);
      expect(service.search).toHaveBeenCalledWith(searchDto);
    });

    it('should handle custom pagination parameters', async () => {
      // Arrange
      const searchDto = { page: 3, limit: 20 };
      const mockResult = {
        data: [],
        total: 45,
        page: 3,
        limit: 20,
      };
      jest.spyOn(service, 'search').mockResolvedValue(mockResult);

      // Act
      const result = await controller.search(searchDto);

      // Assert
      expect(result.page).toBe(3);
      expect(result.limit).toBe(20);
      expect(service.search).toHaveBeenCalledWith(searchDto);
    });

    it('should return empty results when no users match', async () => {
      // Arrange
      const searchDto = { name: 'nonexistent' };
      const mockResult = {
        data: [],
        total: 0,
        page: 1,
        limit: 10,
      };
      jest.spyOn(service, 'search').mockResolvedValue(mockResult);

      // Act
      const result = await controller.search(searchDto);

      // Assert
      expect(result.data).toEqual([]);
      expect(result.total).toBe(0);
    });
  });
});
