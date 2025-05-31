import { User } from '@modules/users/entities/user.entity';
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class UserIdMatchGuard implements CanActivate {
  // constructor(
  //   @InjectRepository(User) private readonly userRepository: Repository<User>,
  // ) {}
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const userIdFromParam = request.params.userId || request.params.id;
    const userIdFromToken = request.user.id;
    const isMember= request.user.is_member;

    if (userIdFromParam !== userIdFromToken) {
      throw new UnauthorizedException('Unauthorized');
    }
    if (isMember) {
      throw new UnauthorizedException('Unauthorized: You are a member, not an owner');
    }
    return true;
  }
}
