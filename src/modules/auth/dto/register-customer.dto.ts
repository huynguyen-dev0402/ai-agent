import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty } from 'class-validator';

export class RegisterCustomerDto {
  @ApiProperty({
    example: 'https://abc.xyz',
    description: 'Domain',
  })
  @IsNotEmpty({ message: 'Domain required' })
  domain: string;

  @ApiProperty({
    example: 'Customer',
    description: 'Customer name',
  })
  @IsNotEmpty({ message: 'Customer name required' })
  customer_name: string;

  @ApiProperty({ example: 'customer@example.com', description: 'Email' })
  @IsEmail({}, { message: 'Invalid email format' })
  email: string;

  @ApiProperty({ example: '123456', description: 'Password' })
  @IsNotEmpty({ message: 'Password is not empty' })
  password: string;
}
