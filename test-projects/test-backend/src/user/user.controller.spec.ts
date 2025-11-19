import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { SearchUserDto } from './dto/search-user.dto';

describe('UserController', () => {
  let controller: UserController;
  let service: UserService;

  const mockUserService = {
    create: jest.fn(),
    search: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
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

  describe('create', () => {
    it('should create a user', async () => {
      const createDto = { name: 'John Doe', email: 'john@example.com' };
      const expectedResult = { id: 1, ...createDto, createdAt: new Date(), updatedAt: new Date() };

      mockUserService.create.mockResolvedValue(expectedResult);

      const result = await controller.create(createDto);

      expect(result).toEqual(expectedResult);
      expect(service.create).toHaveBeenCalledWith(createDto);
      expect(service.create).toHaveBeenCalledTimes(1);
    });
  });

  describe('search', () => {
    it('should return users matching search criteria', async () => {
      const searchDto: SearchUserDto = {
        name: 'John',
        email: 'john',
        page: 1,
        limit: 10,
      };
      const expectedResult = [
        { id: 1, name: 'John Doe', email: 'john@example.com', createdAt: new Date(), updatedAt: new Date() },
        { id: 2, name: 'Johnny Smith', email: 'johnny@example.com', createdAt: new Date(), updatedAt: new Date() },
      ];

      mockUserService.search.mockResolvedValue(expectedResult);

      const result = await controller.search(searchDto);

      expect(result).toEqual(expectedResult);
      expect(service.search).toHaveBeenCalledWith(searchDto);
      expect(service.search).toHaveBeenCalledTimes(1);
    });

    it('should return users filtered by name only', async () => {
      const searchDto: SearchUserDto = {
        name: 'Jane',
      };
      const expectedResult = [
        { id: 3, name: 'Jane Doe', email: 'jane@example.com', createdAt: new Date(), updatedAt: new Date() },
      ];

      mockUserService.search.mockResolvedValue(expectedResult);

      const result = await controller.search(searchDto);

      expect(result).toEqual(expectedResult);
      expect(service.search).toHaveBeenCalledWith(searchDto);
    });

    it('should return users filtered by email only', async () => {
      const searchDto: SearchUserDto = {
        email: 'example.com',
      };
      const expectedResult = [
        { id: 1, name: 'John Doe', email: 'john@example.com', createdAt: new Date(), updatedAt: new Date() },
      ];

      mockUserService.search.mockResolvedValue(expectedResult);

      const result = await controller.search(searchDto);

      expect(result).toEqual(expectedResult);
      expect(service.search).toHaveBeenCalledWith(searchDto);
    });

    it('should return empty array when no users match', async () => {
      const searchDto: SearchUserDto = {
        name: 'NonExistent',
      };

      mockUserService.search.mockResolvedValue([]);

      const result = await controller.search(searchDto);

      expect(result).toEqual([]);
      expect(service.search).toHaveBeenCalledWith(searchDto);
    });

    it('should handle pagination parameters', async () => {
      const searchDto: SearchUserDto = {
        page: 2,
        limit: 5,
      };
      const expectedResult = [
        { id: 6, name: 'User 6', email: 'user6@example.com', createdAt: new Date(), updatedAt: new Date() },
      ];

      mockUserService.search.mockResolvedValue(expectedResult);

      const result = await controller.search(searchDto);

      expect(result).toEqual(expectedResult);
      expect(service.search).toHaveBeenCalledWith(searchDto);
    });
  });

  describe('findAll', () => {
    it('should return all users', async () => {
      const expectedResult = [
        { id: 1, name: 'John Doe', email: 'john@example.com', createdAt: new Date(), updatedAt: new Date() },
      ];

      mockUserService.findAll.mockResolvedValue(expectedResult);

      const result = await controller.findAll();

      expect(result).toEqual(expectedResult);
      expect(service.findAll).toHaveBeenCalledTimes(1);
    });
  });

  describe('findOne', () => {
    it('should return a user by id', async () => {
      const expectedResult = { id: 1, name: 'John Doe', email: 'john@example.com', createdAt: new Date(), updatedAt: new Date() };

      mockUserService.findOne.mockResolvedValue(expectedResult);

      const result = await controller.findOne('1');

      expect(result).toEqual(expectedResult);
      expect(service.findOne).toHaveBeenCalledWith(1);
      expect(service.findOne).toHaveBeenCalledTimes(1);
    });
  });

  describe('update', () => {
    it('should update a user', async () => {
      const updateDto = { name: 'Jane Doe', email: 'jane@example.com' };
      const expectedResult = { id: 1, ...updateDto, createdAt: new Date(), updatedAt: new Date() };

      mockUserService.update.mockResolvedValue(expectedResult);

      const result = await controller.update('1', updateDto);

      expect(result).toEqual(expectedResult);
      expect(service.update).toHaveBeenCalledWith(1, updateDto);
      expect(service.update).toHaveBeenCalledTimes(1);
    });
  });

  describe('remove', () => {
    it('should remove a user', async () => {
      const expectedResult = { id: 1, name: 'John Doe', email: 'john@example.com', createdAt: new Date(), updatedAt: new Date() };

      mockUserService.remove.mockResolvedValue(expectedResult);

      const result = await controller.remove('1');

      expect(result).toEqual(expectedResult);
      expect(service.remove).toHaveBeenCalledWith(1);
      expect(service.remove).toHaveBeenCalledTimes(1);
    });
  });
});
