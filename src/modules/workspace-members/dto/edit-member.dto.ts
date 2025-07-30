import { IsEmail, IsEnum, IsNotEmpty, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { WorkspaceMemberRole } from '../entities/workspace-member.entity';

export class EditMemberDto {
  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'UUID of the user whose role is being updated',
  })
  @IsNotEmpty({ message: 'user is not empty' })
  @IsUUID(4, { message: 'user id is uuid' })
  userId: string;

  @ApiProperty({
    example: WorkspaceMemberRole.ADMIN,
    description: 'New role for the member',
    enum: WorkspaceMemberRole,
  })
  @IsNotEmpty({ message: 'Role is not empty' })
  @IsEnum(WorkspaceMemberRole, { message: 'Invalid role' })
  role: WorkspaceMemberRole;
}
