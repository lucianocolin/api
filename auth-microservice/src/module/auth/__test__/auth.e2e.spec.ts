import { INestMicroservice } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../../app/app.module';
import { AuthService } from '../service/auth.service';
import {
  ClientProxy,
  ClientProxyFactory,
  Transport,
} from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';
import { getModelToken } from '@nestjs/mongoose';
import { User } from '../schemas/user.schema';
import * as bcrypt from 'bcrypt';

const mockAuthService = {
  register: jest.fn(),
  authenticate: jest.fn(),
};

const mockUserModel = {
  findOne: jest.fn(),
};

jest.mock('bcrypt', () => ({
  compareSync: jest.fn(),
  hashSync: jest.fn(),
}));

describe('Auth Module', () => {
  let app: INestMicroservice;
  let client: ClientProxy;
  let authService: AuthService;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
        {
          provide: getModelToken(User.name),
          useValue: mockUserModel,
        },
      ],
    }).compile();

    app = module.createNestMicroservice({
      transport: Transport.NATS,
    });

    authService = module.get<AuthService>(AuthService);

    client = ClientProxyFactory.create({
      transport: Transport.NATS,
    });

    await app.listen();
  });

  afterAll(async () => {
    await app.close();
    await client.close();
  });

  describe('auth.register', () => {
    it('should register a user', async () => {
      const registerUserDto = {
        email: 'email@example.co',
        password: 'password',
      };

      jest.spyOn(authService, 'register').mockResolvedValueOnce({
        _id: '1',
        email: 'email@example.co',
      } as any);

      const result = await lastValueFrom(
        client.send('auth.register', registerUserDto),
      );

      expect(result).toEqual(expect.any(Object));
    });

    it('should throw an error if user already exists', async () => {
      const registerUserDto = {
        email: 'email@example.co',
        password: 'password',
      };

      mockUserModel.findOne.mockReturnValueOnce({
        email: registerUserDto.email,
      });

      await lastValueFrom(client.send('auth.register', registerUserDto)).catch(
        (error) => {
          expect(error.message).toEqual(
            `User with email ${registerUserDto.email} already exists`,
          );
        },
      );
    });
  });

  describe('auth.authenticate', () => {
    it('should authenticate a user', async () => {
      const authenticateUserDto = {
        email: 'email@example.co',
        password: 'password',
      };

      jest.spyOn(authService, 'authenticate').mockResolvedValueOnce({
        _id: '1',
        email: 'email@example.co',
        token: 'test-token',
      } as any);

      const result = await lastValueFrom(
        client.send('auth.authenticate', authenticateUserDto),
      );

      expect(result).toEqual(expect.any(Object));
    });

    it('should throw an error if user is not found', async () => {
      const authenticateUserDto = {
        email: 'fakeemail@email.co',
        password: 'password',
      };

      mockUserModel.findOne.mockReturnValueOnce(null);

      await lastValueFrom(
        client.send('auth.authenticate', authenticateUserDto),
      ).catch((error) => {
        expect(error.message).toEqual(
          `User with email ${authenticateUserDto.email} not found`,
        );
      });
    });

    it('should throw an error if password is incorrect', async () => {
      const authenticateUserDto = {
        email: 'email@example.co',
        password: 'password',
      };

      mockUserModel.findOne.mockReturnValueOnce({
        email: authenticateUserDto.email,
        password: 'incorrect-password',
      });

      (bcrypt.compareSync as jest.Mock).mockReturnValueOnce(false);

      await lastValueFrom(
        client.send('auth.authenticate', authenticateUserDto),
      ).catch((error) => {
        expect(error.message).toEqual('Invalid password');
      });
    });
  });
});
