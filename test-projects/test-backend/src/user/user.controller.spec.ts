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
    const mockSearchResult = {
      users: [
        { id: 1, email: 'john@example.com', name: 'John Doe', createdAt: new Date(), updatedAt: new Date() },
      ],
      total: 1,
      page: 1,
      limit: 10,
    };

    it('should call service.search with name filter', async () => {
      // Arrange
      mockUserService.search.mockResolvedValue(mockSearchResult);

      // Act
      const result = await controller.search('John', undefined, undefined, undefined);

      // Assert
      expect(result).toEqual(mockSearchResult);
      expect(service.search).toHaveBeenCalledWith({
        name: 'John',
        email: undefined,
        page: undefined,
        limit: undefined,
      });
    });

    it('should call service.search with email filter', async () => {
      // Arrange
      mockUserService.search.mockResolvedValue(mockSearchResult);

      // Act
      const result = await controller.search(undefined, 'john@example', undefined, undefined);

      // Assert
      expect(result).toEqual(mockSearchResult);
      expect(service.search).toHaveBeenCalledWith({
        name: undefined,
        email: 'john@example',
        page: undefined,
        limit: undefined,
      });
    });

    it('should call service.search with both name and email filters', async () => {
      // Arrange
      mockUserService.search.mockResolvedValue(mockSearchResult);

      // Act
      const result = await controller.search('John', 'john@example', undefined, undefined);

      // Assert
      expect(result).toEqual(mockSearchResult);
      expect(service.search).toHaveBeenCalledWith({
        name: 'John',
        email: 'john@example',
        page: undefined,
        limit: undefined,
      });
    });

    it('should call service.search with pagination parameters', async () => {
      // Arrange
      const paginatedResult = { ...mockSearchResult, page: 2, limit: 5 };
      mockUserService.search.mockResolvedValue(paginatedResult);

      // Act
      const result = await controller.search(undefined, undefined, '2', '5');

      // Assert
      expect(result).toEqual(paginatedResult);
      expect(service.search).toHaveBeenCalledWith({
        name: undefined,
        email: undefined,
        page: 2,
        limit: 5,
      });
    });

    it('should call service.search with all parameters', async () => {
      // Arrange
      const fullResult = { ...mockSearchResult, page: 3, limit: 20 };
      mockUserService.search.mockResolvedValue(fullResult);

      // Act
      const result = await controller.search('John', 'example.com', '3', '20');

      // Assert
      expect(result).toEqual(fullResult);
      expect(service.search).toHaveBeenCalledWith({
        name: 'John',
        email: 'example.com',
        page: 3,
        limit: 20,
      });
    });

    it('should call service.search with no parameters', async () => {
      // Arrange
      mockUserService.search.mockResolvedValue(mockSearchResult);

      // Act
      const result = await controller.search(undefined, undefined, undefined, undefined);

      // Assert
      expect(result).toEqual(mockSearchResult);
      expect(service.search).toHaveBeenCalledWith({
        name: undefined,
        email: undefined,
        page: undefined,
        limit: undefined,
      });
    });

    it('should parse page and limit as integers', async () => {
      // Arrange
      mockUserService.search.mockResolvedValue(mockSearchResult);

      // Act
      await controller.search(undefined, undefined, '10', '50');

      // Assert
      expect(service.search).toHaveBeenCalledWith({
        name: undefined,
        email: undefined,
        page: 10,
        limit: 50,
      });
    });
  });
});
