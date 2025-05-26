import { PasswordChangeConstraint } from '@common/validators/password-change.validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsOptional,
  IsString,
  IsEmail,
  Length,
  Validate,
} from 'class-validator';

export class UpdateUserDto {
  @ApiPropertyOptional({
    description: 'User full name',
    minLength: 2,
    maxLength: 50,
    example: 'John Doe',
  })
  @IsOptional()
  @IsString({ message: 'Full name must be a string' })
  @Length(2, 50, {
    message: 'Full name must be between 2 and 50 characters long',
  })
  fullname?: string;

  @ApiPropertyOptional({
    description: 'User phone number',
    minLength: 10,
    maxLength: 15,
    example: '0912345678',
  })
  @IsOptional()
  @IsString({ message: 'Phone number must be a string' })
  @Length(10, 15, {
    message: 'Phone number must be between 10 and 15 characters long',
  })
  phone?: string;

  @ApiPropertyOptional({
    description: 'User email address',
    example: 'user@example.com',
  })
  @IsOptional()
  @IsEmail({}, { message: 'Invalid email format' })
  email?: string;

  @ApiPropertyOptional({
    description: 'User address',
    minLength: 5,
    maxLength: 100,
    example: '123 ABC Street, District 1, Ho Chi Minh City',
  })
  @IsOptional()
  @IsString({ message: 'Address must be a string' })
  @Length(5, 100, {
    message: 'Address must be between 5 and 100 characters long',
  })
  address?: string;

  @ApiPropertyOptional({
    description: 'Old password (required when changing password)',
    example: 'oldPassword123',
  })
  @IsOptional()
  @IsString({ message: 'Old password must be a string' })
  oldPassword?: string;

  @ApiPropertyOptional({
    description: 'New password',
    example: 'newPassword456',
  })
  @IsOptional()
  @IsString({ message: 'New password must be a string' })
  password?: string;

  @Validate(PasswordChangeConstraint, {
    message:
      'Both old and new password must be provided to change the password',
  })
  passwordChangeValidation?: string;
}
