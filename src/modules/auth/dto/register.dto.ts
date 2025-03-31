import {
  IsEmail,
  IsNotEmpty,
  Matches,
} from 'class-validator';
export class RegisterDto {
  @IsEmail({}, { message: 'Invalid email format' })
  email: string;

  @IsNotEmpty({ message: 'Password is not empty' })
  password: string;

  @IsNotEmpty({ message: 'Phone number is required' })
  @Matches(/^(?:\+84|0)([35789]\d{8})$/, {
    message: 'Invalid phone number format',
  })
  phone: string;
}
