import {
  Controller,
  Post,
  Body,
  Inject,
  Get,
  UseGuards,
  Request,
  Query,
} from '@nestjs/common';
import { RegisterUserDto } from './dto/register-user.dto';
import { NATS_SERVICE } from '../transports/nats.module';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { catchError } from 'rxjs';
import { AuthenticateUserDto } from './dto/authenticate-user.dto';
import { JwtAuthGuard } from './guards/auth.guard';
import { SearchUserDto } from './dto/search-user.dto';

@Controller('auth')
export class AuthController {
  constructor(
    @Inject(NATS_SERVICE)
    private readonly client: ClientProxy,
  ) {}

  @Post('register')
  register(@Body() registerUserDto: RegisterUserDto) {
    return this.client.send('auth.register', registerUserDto).pipe(
      catchError((error) => {
        throw new RpcException(error);
      }),
    );
  }

  @Post('authenticate')
  authenticate(@Body() authenticateUserDto: AuthenticateUserDto) {
    return this.client.send('auth.authenticate', authenticateUserDto).pipe(
      catchError((error) => {
        throw new RpcException(error);
      }),
    );
  }

  @UseGuards(JwtAuthGuard)
  @Get('users')
  listUsers(@Request() req, @Query() searchUserDto: SearchUserDto) {
    const token = req.token;

    return this.client.send('auth.listUsers', { token, searchUserDto }).pipe(
      catchError((error) => {
        throw new RpcException(error);
      }),
    );
  }
}
