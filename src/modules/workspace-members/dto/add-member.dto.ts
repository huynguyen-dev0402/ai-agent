import { IsEmail, IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { WorkspaceMemberRole } from '../entities/workspace-member.entity';

export class AddMemberDto {
  @ApiProperty({
    example: 'member@example.com',
    description: 'Email address of the new member',
  })
  @IsNotEmpty({ message: 'email is not empty' })
  @IsEmail({}, { message: 'Invalid email' })
  email: string;

  @ApiProperty({
    example: 'password123',
    description: 'Password for the new member account',
  })
  @IsNotEmpty({ message: 'password is not empty' })
  @IsString({ message: 'Invalid password' })
  password: string;

  @ApiProperty({
    example: WorkspaceMemberRole.MEMBER,
    description: 'Role of the member in the workspace',
    enum: WorkspaceMemberRole,
  })
  @IsNotEmpty({ message: 'Role is not empty' })
  @IsEnum(WorkspaceMemberRole, { message: 'Invalid role' })
  role: WorkspaceMemberRole;
}
