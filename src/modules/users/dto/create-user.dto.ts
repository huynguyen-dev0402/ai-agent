import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsOptional, Matches } from 'class-validator';
import { UserType } from '../entities/user.entity';
export class CreateUserDto {
  @ApiProperty({
    example: 'Nguyen Van A',
    description: 'Full name',
  })
  @IsOptional()
  fullname?: string;

  @ApiProperty({
    example: 'Business',
    description: 'Business name',
  })
  @IsOptional()
  business_name?: string;

  @ApiProperty({
    example: 'https://domain.com',
    description: 'Domain',
  })
  @IsOptional()
  domain?: string;

  @ApiProperty({
    example: 'Ha Noi',
    description: 'Address',
  })
  @IsOptional()
  address?: string;

  @ApiProperty({ example: 'personal', description: 'Type' })
  @IsNotEmpty({ message: 'Must have type user' })
  type: UserType;

  @ApiProperty({ example: 'user@example.com', description: 'Email' })
  @IsEmail({}, { message: 'Invalid email format' })
  email: string;

  @ApiProperty({
    example: '0912345678',
    description:
      'Vietnamese phone number (10 digits, starts with 03x, 05x, 07x, 08x, 09x)',
  })
  @IsOptional()
  @Matches(/^(03|05|07|08|09)[0-9]{8}$/, {
    message:
      'Phone number must be a valid Vietnamese number (e.g., 0912345678)',
  })
  phone?: string;

  @ApiProperty({ example: '123456', description: 'Password' })
  @IsNotEmpty({ message: 'Password is not empty' })
  password: string;
}
