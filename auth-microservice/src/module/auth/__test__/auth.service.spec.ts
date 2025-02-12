import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from '../service/auth.service';
import { JwtService } from '@nestjs/jwt';
import { getModelToken } from '@nestjs/mongoose';
import { User } from '../schemas/user.schema';
import { RpcException } from '@nestjs/microservices';
import * as bcrypt from 'bcrypt';

const mockJwtService = {
  sign: jest.fn(),
};

const mockUserModel = {
  findOne: jest.fn(),
  create: jest.fn(),
};

jest.mock('bcrypt', () => ({
  compareSync: jest.fn(),
  hashSync: jest.fn(),
}));

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
        {
          provide: getModelToken(User.name),
          useValue: mockUserModel,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should register a user', async () => {
    const registerUserDto = {
      email: 'email@example.co',
      password: 'password',
    };

    (bcrypt.hashSync as jest.Mock).mockReturnValueOnce('hashedPassword');
    await service.register(registerUserDto);

    expect(mockUserModel.create).toHaveBeenCalledWith({
      ...registerUserDto,
      password: expect.any(String),
    });
  });

  it('should throw an error if user already exists', async () => {
    const registerUserDto = {
      email: 'email@example.co',
      password: 'password',
    };

    mockUserModel.findOne.mockReturnValueOnce({});

    await expect(() => service.register(registerUserDto)).rejects.toThrow(
      new RpcException({
        status: 400,
        message: `User with email ${registerUserDto.email} already exists`,
      }),
    );
  });

  it('should authenticate a user', async () => {
    const authenticateUserDto = {
      email: 'email@example.co',
      password: 'password',
    };
    const userData = {
      id: '1',
      email: 'email@example.co',
    };

    mockUserModel.findOne.mockReturnValueOnce({
      ...authenticateUserDto,
      id: '1',
      password: 'hashedPassword',
    });
    (bcrypt.compareSync as jest.Mock).mockReturnValueOnce(true);
    mockJwtService.sign.mockReturnValueOnce('test-token');

    await service.authenticate(authenticateUserDto);

    expect(mockUserModel.findOne).toHaveBeenCalledWith({
      email: authenticateUserDto.email,
    });
    expect(mockJwtService.sign).toHaveBeenCalledWith(userData);
  });

  it('should throw an error if user is not found', async () => {
    const authenticateUserDto = {
      email: 'email@example.co',
      password: 'password',
    };

    mockUserModel.findOne.mockReturnValueOnce(null);

    await expect(() =>
      service.authenticate(authenticateUserDto),
    ).rejects.toThrow(
      new RpcException({
        status: 400,
        message: `User with email ${authenticateUserDto.email} not found`,
      }),
    );
  });

  it('should throw an error if password is invalid', async () => {
    const authenticateUserDto = {
      email: 'email@example.co',
      password: 'password',
    };

    mockUserModel.findOne.mockReturnValueOnce({
      ...authenticateUserDto,
      id: '1',
      password: 'hashedPassword',
    });
    (bcrypt.compareSync as jest.Mock).mockReturnValueOnce(false);

    await expect(() =>
      service.authenticate(authenticateUserDto),
    ).rejects.toThrow(
      new RpcException({
        status: 400,
        message: 'Invalid password',
      }),
    );
  });
});
