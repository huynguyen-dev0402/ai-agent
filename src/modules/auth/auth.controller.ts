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
import { RegisterUserDto } from './dto/register-user.dto';
import { LoginDto } from './dto/login.dto';
import { AuthGuard } from './guards/jwt-auth.guard';
import { Request } from 'express';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { RegisterCustomerDto } from './dto/register-customer.dto';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
  ) {}

  @Post('/refresh-token')
  @ApiOperation({ summary: 'Refresh access token' })
  @ApiResponse({ status: 200, description: 'New access token generated' })
  @ApiResponse({ status: 401, description: 'Invalid refresh token' })
  async refreshToken(@Body() body: { refreshToken: string }) {
    const newToken = await this.authService.refreshToken(body);
    if (!newToken) {
      throw new UnauthorizedException('Invalid refresh token');
    }
    return newToken;
  }

  @Delete('/revoke-refresh-token')
  @ApiOperation({ summary: 'Revoke refresh token' })
  @ApiResponse({ status: 200, description: 'Token revoked successfully' })
  revokeRefreshToken(@Body() { refreshToken }) {
    const response = this.authService.revokeRefreshToken(refreshToken);
    if (!response) {
      throw new BadRequestException('Something wrong');
    }
    return {
      success: true,
      message: 'Deleted success',
    };
  }

  @Post('/register')
  @ApiOperation({ summary: 'Register new user' })
  @ApiResponse({ status: 201, description: 'User registered successfully' })
  @ApiResponse({ status: 400, description: 'Email already exsits' })
  async registerUser(
    @Body(new ValidationPipe()) registerUserDto: RegisterUserDto,
  ) {
    const newUser = await this.usersService.create(registerUserDto);
    if (!newUser) {
      throw new BadRequestException('Cannot create account');
    }
    return {
      success: true,
      message: 'User registered successfully',
    };
  }

  @Post('/register-customer')
  @ApiOperation({ summary: 'Register new customer' })
  @ApiResponse({ status: 201, description: 'Customer registered successfully' })
  @ApiResponse({ status: 400, description: 'Email already exsits' })
  async registerCustomer(
    @Body(new ValidationPipe()) registerCustomerDto: RegisterCustomerDto,
  ) {
    const newUser = await this.usersService.create(registerCustomerDto);
    if (!newUser) {
      throw new BadRequestException('Cannot create account');
    }
    return {
      success: true,
      message: 'Customer registered successfully',
    };
  }

  @Post('/login')
  @ApiOperation({ summary: 'Login user' })
  @ApiResponse({ status: 200, description: 'Login successful' })
  @ApiResponse({ status: 401, description: 'Invalid email or password' })
  async login(@Body(new ValidationPipe()) loginDto: LoginDto) {
    const token = await this.authService.validateUser(loginDto);
    if (!token) {
      throw new UnauthorizedException('Invalid email or password');
    }
    return {
      success: true,
      message: 'Login successful',
      token,
    };
  }

  @UseGuards(AuthGuard)
  @Delete('/logout')
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Logout' })
  @ApiResponse({ status: 200, description: 'Logout successful' })
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
