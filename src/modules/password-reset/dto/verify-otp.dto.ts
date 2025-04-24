import { IsNotEmpty, IsEmail, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class VerifyOtpDto {
  @IsNotEmpty({ message: 'Email required' })
  @IsEmail({}, { message: 'Invalid email' })
  @ApiProperty({
    example: 'user@example.com',
    description: 'The email address associated with the account to verify OTP.',
  })
  email: string;

  @IsNotEmpty({ message: 'Must have OTP' })
  @IsString()
  @ApiProperty({
    example: '123456',
    description:
      'The OTP (One Time Password) sent to the user for verification.',
  })
  otp: string;
}
