import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, Matches } from 'class-validator';
export class RegisterDto {
  @ApiProperty({ example: 'user@example.com', description: 'Email' })
  @IsEmail({}, { message: 'Invalid email format' })
  email: string;

  @ApiProperty({ example: '123456', description: 'Password' })
  @IsNotEmpty({ message: 'Password is not empty' })
  password: string;

  @ApiProperty({
    example: '0123456789',
    description: 'Phone number',
  })
  @IsNotEmpty({ message: 'Phone number is required' })
  @Matches(/^(?:\+84|0)([35789]\d{8})$/, {
    message: 'Invalid phone number format',
  })
  phone: string;
}
