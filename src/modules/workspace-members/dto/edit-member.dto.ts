import { IsEmail, IsEnum, IsNotEmpty, IsUUID } from 'class-validator';
import { WorkspaceMemberRole } from '../entities/workspace-member.entity';

export class EditMemberDto {
  @IsNotEmpty({ message: 'user is not empty' })
  @IsUUID(4, { message: 'user id is uuid' })
  userId: string;

  @IsNotEmpty({ message: 'Role is not empty' })
  @IsEnum(WorkspaceMemberRole, { message: 'Invalid role' })
  role: WorkspaceMemberRole;
}
