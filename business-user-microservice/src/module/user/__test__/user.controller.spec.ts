import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from '../user.controller';
import { UserService } from '../service/user.service';

describe('UserController', () => {
  let controller: UserController;

  const mockUserService = {
    getAll: jest.fn(),
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
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getAll', () => {
    it('should return all users with pagination', async () => {
      const token = 'token';
      const searchUserDto = {
        limit: 10,
        offset: 0,
        email: '',
      };

      const expectedUsers = ['user1', 'user2'];
      mockUserService.getAll.mockResolvedValue(expectedUsers);

      const result = await controller.getAll({ token, searchUserDto });

      expect(mockUserService.getAll).toHaveBeenCalledWith(token, searchUserDto);
      expect(result).toEqual(expectedUsers);
    });
  });
});
