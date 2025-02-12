import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User } from '../schemas/user.schema';
import { Model } from 'mongoose';
import { SearchUserDto } from '../dto/search-user.dto';
import { RpcException } from '@nestjs/microservices';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
  ) {}

  getAll(token: string, searchUserDto: SearchUserDto) {
    const { limit, offset, email } = searchUserDto;
    const query = {};

    if (!token) {
      throw new RpcException({
        status: 401,
        message: 'Unauthorized',
      });
    }

    if (email) {
      query['email'] = email;
    }

    return this.userModel.find(query).limit(limit).skip(offset);
  }
}
