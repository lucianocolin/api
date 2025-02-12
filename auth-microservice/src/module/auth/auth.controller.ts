import { Controller, Inject } from '@nestjs/common';
import { ClientProxy, MessagePattern, Payload } from '@nestjs/microservices';
import { AuthService } from './service/auth.service';
import { RegisterUserDto } from './dto/register-user.dto';
import { AuthenticateUserDto } from './dto/authenticate-user.dto';
import { NATS_SERVICE } from '../transports/nats.module';
import { SearchUserDto } from './dto/search-user.dto';

@Controller()
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    @Inject(NATS_SERVICE)
    private readonly client: ClientProxy,
  ) {}

  @MessagePattern('auth.register')
  create(@Payload() registerUserDto: RegisterUserDto) {
    return this.authService.register(registerUserDto);
  }

  @MessagePattern('auth.authenticate')
  async authenticate(@Payload() authenticateUserDto: AuthenticateUserDto) {
    return await this.authService.authenticate(authenticateUserDto);
  }

  @MessagePattern('auth.listUsers')
  async listUsers(
    @Payload() data: { token: string; searchUserDto: SearchUserDto },
  ) {
    return this.client.send('business.user.getAll', data);
  }
}
