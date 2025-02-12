import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from '../auth.controller';
import { AuthService } from '../service/auth.service';
import { NATS_SERVICE } from '../../transports/nats.module';

describe('AuthController', () => {
  let controller: AuthController;

  const mockAuthService = {
    register: jest.fn(),
    authenticate: jest.fn(),
  };

  const mockNatsClient = {
    send: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
        {
          provide: NATS_SERVICE,
          useValue: mockNatsClient,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should register a new user', async () => {
      const registerUserDto = {
        email: 'email@example.co',
        password: 'password',
      };

      const expectedUser = {
        _id: '1',
        email: 'email@example.co',
        password: 'hashedPassword',
      };

      mockAuthService.register.mockResolvedValue(expectedUser);
      const result = await controller.create(registerUserDto);

      expect(mockAuthService.register).toHaveBeenCalledWith(registerUserDto);
      expect(result).toEqual(expectedUser);
    });
  });

  describe('authenticate', () => {
    it('should authenticate a user', async () => {
      const authenticateUserDto = {
        email: 'email@example.co',
        password: 'password',
      };

      const expectedUser = {
        _id: '1',
        email: 'email@example.co',
        password: 'hashedPassword',
        token: 'test-token',
      };

      mockAuthService.authenticate.mockResolvedValue(expectedUser);
      const result = await controller.authenticate(authenticateUserDto);

      expect(mockAuthService.authenticate).toHaveBeenCalledWith(
        authenticateUserDto,
      );
      expect(result).toEqual(expectedUser);
    });
  });

  describe('listUsers', () => {
    it('should list users', async () => {
      const token = 'test-token';
      const searchUserDto = {
        email: 'email@example.co',
      };

      const expectedUsers = [
        {
          _id: '1',
          email: 'email@example.co',
          password: 'hashedPassword',
        },
      ];

      mockNatsClient.send.mockResolvedValue(expectedUsers);
      const result = await controller.listUsers({ token, searchUserDto });

      expect(mockNatsClient.send).toHaveBeenCalledWith('business.user.getAll', {
        token,
        searchUserDto,
      });
      expect(result).toEqual(expectedUsers);
    });
  });
});
