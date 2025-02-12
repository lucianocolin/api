import { Injectable } from '@nestjs/common';
import { RegisterUserDto } from '../dto/register-user.dto';
import { JwtService } from '@nestjs/jwt';
import { IJwtPayload } from '../interfaces/jwt-payload.interface';
import { RpcException } from '@nestjs/microservices';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from '../schemas/user.schema';
import * as bcrypt from 'bcrypt';
import { AuthenticateUserDto } from '../dto/authenticate-user.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    @InjectModel(User.name) private readonly userModel: Model<User>,
  ) {}

  async register(registerUserDto: RegisterUserDto) {
    const user = await this.userModel.findOne({
      email: registerUserDto.email,
    });

    if (user) {
      throw new RpcException({
        status: 400,
        message: `User with email ${registerUserDto.email} already exists`,
      });
    }

    const newUser = await this.userModel.create({
      ...registerUserDto,
      password: bcrypt.hashSync(registerUserDto.password, 10),
    });

    return newUser;
  }

  async authenticate(authenticateUserDto: AuthenticateUserDto) {
    try {
      const { email, password } = authenticateUserDto;
      const user = await this.userModel.findOne({ email });

      if (!user) {
        throw new RpcException({
          status: 400,
          message: `User with email ${email} not found`,
        });
      }

      const isPasswordValid = bcrypt.compareSync(password, user.password);

      if (!isPasswordValid) {
        throw new RpcException({
          status: 400,
          message: 'Invalid password',
        });
      }

      const userData = {
        id: user.id,
        email: user.email,
      };

      return {
        user: userData,
        token: this.signJwt(userData),
      };
    } catch (error) {
      throw new RpcException({
        status: 400,
        message: error.message,
      });
    }
  }

  private signJwt(payload: IJwtPayload) {
    return this.jwtService.sign(payload);
  }
}
