import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { AuthService } from '../auth.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly authService: AuthService) {}
  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    const token =
      request.get('Authorization')?.split(' ').slice(-1).join() ?? '';
    const user = await this.authService.getUser(token);
    if (!user) {
      throw new UnauthorizedException('Invalid token');
    }
    const decode = this.authService.decodeToken(token);
    request.user = user;
    request.user.accessToken = token;
    request.user.expToken = decode.exp;
    return true;
  }
}
