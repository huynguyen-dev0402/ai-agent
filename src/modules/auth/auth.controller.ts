import {
  Controller,
  Post,
  Body,
  BadRequestException,
  UnauthorizedException,
  ValidationPipe,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
  ) {}

  @Post('/register')
  async register(@Body(new ValidationPipe()) registerDto: RegisterDto) {
    const { email, phone } = registerDto;
    const existsEmail = await this.usersService.findOneByEmail(email);
    const existsPhone = await this.usersService.findOneByPhone(phone);
    if (existsEmail || existsPhone) {
      throw new BadRequestException('Email or Phone number is already in use');
    }
    await this.usersService.create(registerDto);
    return {
      message: 'User registered successfully',
    };
  }

  @Post('/login')
  async login(@Body(new ValidationPipe()) loginDto: LoginDto) {
    const token = await this.authService.validateUser(loginDto);
    if (!token) {
      throw new UnauthorizedException('Invalid email or password');
    }
    return {
      token: token,
    };
  }
}
