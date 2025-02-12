import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from '../auth.controller';
import { NATS_SERVICE } from '../../transports/nats.module';
import { JwtAuthGuard } from '../guards/auth.guard';
import { lastValueFrom, of, throwError } from 'rxjs';
import { RpcException } from '@nestjs/microservices';

describe('AuthController', () => {
  let controller: AuthController;

  const clientMock = {
    send: jest.fn(),
  };

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: NATS_SERVICE,
          useValue: clientMock,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({
        canActivate: jest.fn(() => true),
      })
      .compile();

    controller = module.get<AuthController>(AuthController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('POST /auth/register', () => {
    it('should register a user succesfully', async () => {
      const mockUserDto = { email: 'test@example.com', password: 'test123' };
      const expectedUser = { id: '123', email: 'test@example.com' };

      clientMock.send.mockReturnValue(
        of({ id: '123', email: 'test@example.com' }),
      );

      const result = await lastValueFrom(controller.register(mockUserDto));
      expect(result).toEqual(expectedUser);
    });

    it('should throw an error if registration fails', async () => {
      const mockUserDto = { email: 'test@example.com', password: 'test123' };
      const errorMessage = 'Registration failed';

      clientMock.send.mockReturnValue(
        throwError(() => new RpcException(errorMessage)),
      );

      await expect(
        lastValueFrom(controller.register(mockUserDto)),
      ).rejects.toThrow(new RpcException(errorMessage));
    });
  });

  describe('POST /auth/authenticate', () => {
    it('should authenticate a user succesfully', async () => {
      const mockUserDto = { email: 'test@example.com', password: 'test123' };
      const expectedUser = { id: '123', email: 'test@example.com' };

      clientMock.send.mockReturnValue(
        of({ id: '123', email: 'test@example.com' }),
      );

      const result = await lastValueFrom(controller.authenticate(mockUserDto));
      expect(result).toEqual(expectedUser);
    });

    it('should throw an error if authentication fails', async () => {
      const mockUserDto = { email: 'test@example.com', password: 'test123' };
      const errorMessage = 'Authentication failed';

      clientMock.send.mockReturnValue(
        throwError(() => new RpcException(errorMessage)),
      );

      await expect(
        lastValueFrom(controller.authenticate(mockUserDto)),
      ).rejects.toThrow(new RpcException(errorMessage));
    });
  });

  describe('GET /auth/listUsers', () => {
    it('should list users successfully', async () => {
      const mockUserDto = { email: 'test@example.com', limit: 10, offset: 0 };
      const mockReq = { token: 'test-token' };
      const expectedUser = { id: '123', email: 'test@example.com' };

      clientMock.send.mockReturnValue(
        of({ id: '123', email: 'test@example.com' }),
      );

      const result = await lastValueFrom(
        controller.listUsers(mockReq, mockUserDto),
      );
      expect(result).toEqual(expectedUser);
    });

    it('should throw an error if listing users fails', async () => {
      const mockUserDto = { email: 'test@example.com', limit: 10, offset: 0 };
      const mockReq = { token: 'test-token' };
      const errorMessage = 'Listing users failed';

      clientMock.send.mockReturnValue(
        throwError(() => new RpcException(errorMessage)),
      );

      await expect(
        lastValueFrom(controller.listUsers(mockReq, mockUserDto)),
      ).rejects.toThrow(new RpcException(errorMessage));
    });
  });
});
