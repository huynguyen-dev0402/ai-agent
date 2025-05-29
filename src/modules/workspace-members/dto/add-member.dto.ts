import { IsEmail, IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { WorkspaceMemberRole } from '../entities/workspace-member.entity';

export class AddMemberDto {
  @IsNotEmpty({ message: 'email is not empty' })
  @IsEmail({}, { message: 'Invalid email' })
  email: string;

  @IsNotEmpty({ message: 'password is not empty' })
  @IsString({ message: 'Invalid password' })
  password: string;

  @IsNotEmpty({ message: 'Role is not empty' })
  @IsEnum(WorkspaceMemberRole, { message: 'Invalid role' })
  role: WorkspaceMemberRole;
}
