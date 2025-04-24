import { IsString, IsNotEmpty, IsEmail } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ForgotPasswordDto {
  @IsNotEmpty({ message: 'Email required' })
  @IsEmail({}, { message: 'Invalid email' })
  @ApiProperty({
    example: 'user@example.com',
    description:
      'The email address associated with the account for which you want to reset the password.',
  })
  email: string;
}
