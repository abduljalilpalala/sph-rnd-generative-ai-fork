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
    bulkCreateFromExcel: jest.fn(),
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

  describe('bulkUpload', () => {
    it('should call bulkCreateFromExcel with the uploaded file', async () => {
      const file = {
        originalname: 'test.xlsx',
        buffer: Buffer.from('test'),
      } as Express.Multer.File;

      const mockResponse = {
        success: true,
        message: 'Successfully created 2 user(s)',
        created: 2,
        failed: 0,
        errors: [],
      };

      mockUserService.bulkCreateFromExcel.mockResolvedValue(mockResponse);

      const result = await controller.bulkUpload(file);

      expect(service.bulkCreateFromExcel).toHaveBeenCalledWith(file);
      expect(result).toEqual(mockResponse);
    });
  });
});
