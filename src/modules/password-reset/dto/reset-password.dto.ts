import { IsString, IsNotEmpty, IsEmail } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ResetPasswordDto {
  @IsNotEmpty({ message: 'Email required' })
  @IsEmail({}, { message: 'Invalid email' })
  @ApiProperty({
    example: 'user@example.com',
    description:
      'The email address associated with the account for which you want to reset the password.',
  })
  email: string;

  @IsNotEmpty({ message: 'OTP is required' })
  @IsString()
  @ApiProperty({
    example: '123456',
    description:
      'The OTP (One-Time Password) sent to your email for verifying the password reset request.',
  })
  otp: string;

  @IsNotEmpty({ message: 'Must have new password' })
  @IsString()
  @ApiProperty({
    example: 'newSecurePassword123!',
    description:
      'The new password you want to set for your account. It should be secure and meet the required criteria.',
  })
  new_password: string;
}
