import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { UserService } from './service/user.service';
import { SearchUserDto } from './dto/search-user.dto';

@Controller()
export class UserController {
  constructor(private readonly userService: UserService) {}

  @MessagePattern('business.user.getAll')
  async getAll(
    @Payload() data: { token: string; searchUserDto: SearchUserDto },
  ) {
    const { token, searchUserDto } = data;

    return this.userService.getAll(token, searchUserDto);
  }
}
