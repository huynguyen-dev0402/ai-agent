import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';

@Injectable()
export class UserIdMatchGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const userIdFromParam = request.params.userId || request.params.id;
    const userIdFromToken = request.user.id;

    if (userIdFromParam !== userIdFromToken) {
      throw new UnauthorizedException('Unauthorized');
    }
    return true;
  }
}
