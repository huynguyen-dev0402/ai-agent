import { User } from '@modules/users/entities/user.entity';
import {
  WorkspaceMember,
  WorkspaceMemberRole,
} from '@modules/workspace-members/entities/workspace-member.entity';
import { Workspace } from '@modules/workspaces/entities/workspace.entity';
import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class AdminGuard implements CanActivate {
  constructor(
    @InjectRepository(WorkspaceMember)
    private workspaceMembersRepository: Repository<WorkspaceMember>,
    @InjectRepository(Workspace)
    private workspaceRepository: Repository<Workspace>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const userId = request.user?.id; // Lấy từ JwtAuthGuard
    const workspaceId = request.params.workspaceId;

    if (!userId || !workspaceId) {
      throw new ForbiddenException('Missing user or workspace information');
    }

    const workspace = await this.workspaceRepository.findOne({
      where: {
        id: workspaceId,
        users: {
          id: userId,
        },
      },
      relations: {
        users: true,
      },
      select: {
        id: true,
      },
    });

    if (!workspace) {
      throw new NotFoundException('User does not have any workspace yet');
    }

    if (workspace.id === workspaceId) {
      return true;
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
