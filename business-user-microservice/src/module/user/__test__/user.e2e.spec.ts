import { Test, TestingModule } from '@nestjs/testing';
import { INestMicroservice } from '@nestjs/common';
import {
  ClientProxy,
  ClientProxyFactory,
  Transport,
} from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';
import { UserService } from '../service/user.service';
import { AppModule } from '../../app/app.module';

describe('User Module', () => {
  let app: INestMicroservice;
  let client: ClientProxy;

  const mockUserService = {
    getAll: jest.fn(),
  };

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
      providers: [
        {
          provide: UserService,
          useValue: mockUserService,
        },
      ],
    }).compile();

    app = module.createNestMicroservice({
      transport: Transport.NATS,
    });

    client = ClientProxyFactory.create({
      transport: Transport.NATS,
    });

    await app.listen();
  });

  afterAll(async () => {
    await app.close();
    await client.close();
  });

  describe('business.user.getAll', () => {
    it('should return all users with pagination', async () => {
      const searchUserDto = {
        limit: 10,
        offset: 0,
        email: 'email@test.co',
      };

      const token = 'test-token';

      const result = await lastValueFrom(
        client.send('business.user.getAll', {
          token,
          searchUserDto,
        }),
      );

      expect(result).toEqual(expect.any(Array));
    });

    it('should throw UnauthorizedException when no token is provided', async () => {
      const searchUserDto = {
        limit: 10,
        offset: 0,
        email: 'test@test.com',
      };

      const token = '';

      await expect(
        lastValueFrom(
          client.send('business.user.getAll', {
            token,
            searchUserDto,
          }),
        ),
      ).rejects.toEqual({
        status: 401,
        message: 'Unauthorized',
      });
    });
  });
});
