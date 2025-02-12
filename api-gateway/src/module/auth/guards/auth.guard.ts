import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = this.getRequest(context);
    const token = request.headers.authorization?.split(' ')[1];

    if (!token) {
      throw new UnauthorizedException();
    }

    try {
      const verifiedUser = this.jwtService.verify(token);
      request.user = verifiedUser;
      request.token = token;
      return true;
    } catch (err) {
      return false;
    }
  }

  private getRequest(context: ExecutionContext) {
    const type = context.getType();
    if (type === 'http') {
      return context.switchToHttp().getRequest();
    } else if (type === 'rpc') {
      return context.switchToRpc().getContext();
    }
  }
}
