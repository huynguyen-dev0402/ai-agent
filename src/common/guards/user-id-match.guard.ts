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
    const isMember = request.user.is_member;

    if (userIdFromParam !== userIdFromToken) {
      throw new UnauthorizedException('Unauthorized');
    }
    if (isMember) {
      throw new UnauthorizedException(
        'Unauthorized: You are a member, not an owner',
      );
    }
    return true;
  }
}
