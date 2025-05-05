import { IsEnum, IsUUID } from 'class-validator';
import { WorkspaceMemberRole } from '../entities/workspace-member.entity';

export class AddMemberDto {
  @IsUUID('4', { message: 'userId must be a valid UUID' })
  userId: string;

  @IsEnum(WorkspaceMemberRole, { message: 'Invalid role' })
  role: WorkspaceMemberRole;
}
