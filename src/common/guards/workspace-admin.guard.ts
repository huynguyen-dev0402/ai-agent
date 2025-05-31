// import {
//   WorkspaceMember,
//   WorkspaceMemberRole,
// } from '@modules/workspace-members/entities/workspace-member.entity';
// import { Workspace } from '@modules/workspaces/entities/workspace.entity';
// import {
//   CanActivate,
//   ExecutionContext,
//   ForbiddenException,
//   Injectable,
//   Logger,
//   NotFoundException,
// } from '@nestjs/common';
// import { InjectRepository } from '@nestjs/typeorm';
// import { Repository } from 'typeorm';

// @Injectable()
// export class MemberGuard implements CanActivate {
//   private readonly logger = new Logger(MemberGuard.name);

//   constructor(
//     @InjectRepository(WorkspaceMember)
//     private workspaceMembersRepository: Repository<WorkspaceMember>,
//     @InjectRepository(Workspace)
//     private workspaceRepository: Repository<Workspace>,
//   ) {}

//   async canActivate(context: ExecutionContext): Promise<boolean> {
//     const request = context.switchToHttp().getRequest();
//     const userId = request.user?.id;

//     if (!userId || !workspaceId) {
//       this.logger.warn('Missing user or workspace information');
//       throw new ForbiddenException('Missing user or workspace information');
//     }

//     const inviter = await this.workspaceMembersRepository.findOne({
//       where: {
//         invited_by: userId,
//       },
//       select: ['id'],
//     });

//     if (!inviter) {
//       this.logger.warn(
//         `Workspace not found or user ${userId} does not belong to workspace ${workspaceId}`,
//       );
//       throw new NotFoundException('User does not have any workspace yet');
//     }

//     if (inviter.id === userId) {
//       this.logger.log(`User ${userId} is owner of workspace ${workspaceId}`);
//       return true;
//     }

//     const isAdmin = await this.workspaceMembersRepository.findOne({
//       where: {
//         id: workspaceId,
//         user: { id: userId },
//         role: WorkspaceMemberRole.ADMIN,
//       },
//     });

//     if (!isAdmin) {
//       this.logger.warn(
//         `User ${userId} is not admin in workspace ${workspaceId}`,
//       );
//       throw new ForbiddenException(
//         'You do not have admin rights in this workspace',
//       );
//     }

//     this.logger.log(`User ${userId} is admin in workspace ${workspaceId}`);
//     return true;
//   }
// }
