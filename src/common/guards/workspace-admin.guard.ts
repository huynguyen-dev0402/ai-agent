import { WorkspaceMember, WorkspaceMemberRole } from '@modules/workspace-members/entities/workspace-member.entity';
import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class AdminGuard implements CanActivate {
  constructor(
    @InjectRepository(WorkspaceMember)
    private workspaceMembersRepository: Repository<WorkspaceMember>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const userId = request.user?.id; // Lấy từ JwtAuthGuard
    const workspaceId = request.params.workspaceId;

    if (!userId || !workspaceId) {
      throw new ForbiddenException('Missing user or workspace information');
    }

    const isAdmin = await this.workspaceMembersRepository.findOne({
      where: {
        id: workspaceId,
        user: { id: userId },
        role: WorkspaceMemberRole.ADMIN,
      },
    });

    if (!isAdmin) {
      throw new ForbiddenException(
        'You do not have admin rights in this workspace',
      );
    }

    return true;
  }
}
