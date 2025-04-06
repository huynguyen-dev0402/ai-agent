import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty } from 'class-validator';
import { UserType } from 'src/modules/users/entities/user.entity';
export class RegisterUserDto {
  @ApiProperty({
    example: 'Nguyen Van A',
    description: 'Full name',
  })
  @IsNotEmpty({ message: 'Full name is required' })
  fullname: string;

  @ApiProperty({ example: 'personal', description: 'Type' })
  @IsNotEmpty({ message: 'Must have type user' })
  type: UserType;

  @ApiProperty({ example: 'user@example.com', description: 'Email' })
  @IsEmail({}, { message: 'Invalid email format' })
  email: string;

  @ApiProperty({ example: '123456', description: 'Password' })
  @IsNotEmpty({ message: 'Password is not empty' })
  password: string;
}
