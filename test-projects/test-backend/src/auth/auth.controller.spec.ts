import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

describe('AuthController', () => {
  let controller: AuthController;
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: {
            login: jest.fn(),
            validateUser: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    service = module.get<AuthService>(AuthService);
  });

  describe('login', () => {
    it('should return access token and user data', async () => {
      const loginDto = { email: 'test@example.com', password: 'password123' };
      const result = {
        accessToken: 'mock-token',
        user: { id: 1, email: 'test@example.com', name: 'Test User' },
      };

      jest.spyOn(service, 'login').mockResolvedValue(result);

      expect(await controller.login(loginDto)).toBe(result);
      expect(service.login).toHaveBeenCalledWith('test@example.com', 'password123');
    });
  });

  describe('getProfile', () => {
    it('should return user profile', async () => {
      const req = { user: { userId: 1 } };
      const result = { id: 1, email: 'test@example.com', name: 'Test User' };

      jest.spyOn(service, 'validateUser').mockResolvedValue(result);

      expect(await controller.getProfile(req)).toBe(result);
      expect(service.validateUser).toHaveBeenCalledWith(1);
    });
  });

  describe('logout', () => {
    it('should return success message', async () => {
      const result = await controller.logout();

      expect(result).toEqual({ message: 'Logged out successfully' });
    });
  });
});
