import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsNotEmpty } from 'class-validator';

export enum AccountType {
  CUSTOMER = 'customer',
  PERSONAL = 'personal',
}

export class LoginDto {
  @ApiProperty({ example: 'user@example.com', description: 'Email' })
  @IsEmail({}, { message: 'Invalid email format' })
  email: string;

  @ApiProperty({ example: '123456', description: 'Password' })
  @IsNotEmpty({ message: 'Password is not empty' })
  password: string;

  @ApiProperty({
    enum: AccountType,
    description: 'Account type',
    example: AccountType.PERSONAL,
  })
  @IsEnum(AccountType, { message: 'Type must be either customer or personal' })
  type: AccountType;
}
