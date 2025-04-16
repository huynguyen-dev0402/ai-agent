import { IsString, IsArray, IsNotEmpty, IsOptional, IsEmail } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ForgotPasswordDto {
  @IsNotEmpty({ message: 'Email required' })
  @IsEmail({},{ message: 'Invalid email' })
  email: string;
}
