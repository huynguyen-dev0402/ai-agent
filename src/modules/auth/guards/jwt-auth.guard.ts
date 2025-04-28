import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { AuthService } from '../auth.service';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from 'src/common/decorators/public-route.decorator';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly authService: AuthService) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const reflector = new Reflector();
    const isPublic = reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const token =
      request.get('Authorization')?.split(' ').slice(-1).join() ?? '';
    if (!token) {
      throw new UnauthorizedException('Invalid token');
    }
    const user = await this.authService.getUser(token);
    if (!user) {
      throw new UnauthorizedException('Invalid token');
    }
    let decode: { exp: number };
    try {
      decode = this.authService.decodeToken(token);
    } catch (error) {
      throw new UnauthorizedException('Cannot decode token');
    }
    request.user = {
      ...user,
      accessToken: token,
      expToken: decode.exp,
    };
    return true;
  }
}
