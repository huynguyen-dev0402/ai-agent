import {
  Controller,
  Post,
  Body,
  BadRequestException,
  UnauthorizedException,
  ValidationPipe,
  Delete,
  UseGuards,
  Req,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { AuthGuard } from './guards/jwt-auth.guard';
import { Request } from 'express';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
  ) {}

  @Post('/refresh-token')
  async refreshToken(@Body() body: { refreshToken: string }) {
    const newToken = await this.authService.refreshToken(body);
    if (!newToken) {
      throw new UnauthorizedException('Invalid refresh token');
    }
    return newToken;
  }

  @Delete('/revoke-refresh-token')
  revokeRefreshToken(@Body() { refreshToken }) {
    this.authService.revokeRefreshToken(refreshToken);
    return {
      success: true,
      message: 'Delete success',
    };
  }

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

  @UseGuards(AuthGuard)
  @Delete('/logout')
  async logout(@Req() request: Request & { user: { [key: string]: string } }) {
    const accessToken = request.user.accessToken;
    const expToken = request.user.expToken;
    await this.authService.logout(accessToken, +expToken);
    return {
      success: true,
      message: 'Logout success',
    };
  }
}
