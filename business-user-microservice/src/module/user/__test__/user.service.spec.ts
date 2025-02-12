import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from '../service/user.service';
import { User } from '../schemas/user.schema';
import { getModelToken } from '@nestjs/mongoose';
import { RpcException } from '@nestjs/microservices';

const mockUserModel = {
  find: jest.fn().mockReturnThis(),
  limit: jest.fn().mockReturnThis(),
  skip: jest.fn().mockReturnThis(),
};

describe('UserService', () => {
  let service: UserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getModelToken(User.name),
          useValue: mockUserModel,
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return all users with pagination', async () => {
    const searchUserDto = {
      limit: 10,
      offset: 0,
      email: 'email@test.co',
    };

    const token = 'test-token';

    await service.getAll(token, searchUserDto);

    expect(mockUserModel.find).toHaveBeenCalledWith({
      email: 'email@test.co',
    });
    expect(mockUserModel.limit).toHaveBeenCalledWith(10);
    expect(mockUserModel.skip).toHaveBeenCalledWith(0);
  });

  it('should return an unauthorized exception if a token is not provided', async () => {
    const searchUserDto = {
      limit: 10,
      offset: 0,
      email: 'email@test.co',
    };

    expect(() => service.getAll('', searchUserDto)).toThrow(
      new RpcException({
        status: 401,
        message: 'Unauthorized',
      }),
    );
  });
});
