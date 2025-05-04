import {
  Controller,
  Post,
  Body,
  BadRequestException,
  UnauthorizedException,
  ValidationPipe,
  Delete,
  Req,
} from '@nestjs/common';
import { AuthService } from '@modules/auth/auth.service';
import { UsersService } from '@modules/users/users.service';
import { RegisterUserDto } from './dto/register-user.dto';
import { LoginDto } from './dto/login.dto';
import { Request } from 'express';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Public } from '@common/decorators/public-route.decorator';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
  ) {}

  @Post('/refresh-token')
  @Public()
  @ApiOperation({
    summary: 'Refresh access token',
    description: 'Cung cấp refresh token để lấy access token mới',
  })
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
  @Public()
  @ApiOperation({
    summary: 'Revoke refresh token',
    description: 'Thu hồi refresh token hiện tại',
  })
  @ApiResponse({ status: 200, description: 'Token revoked successfully' })
  @ApiResponse({ status: 400, description: 'Something wrong' })
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
  @Public()
  @ApiOperation({
    summary: 'Register new user',
    description: 'Đăng ký người dùng thông thường (user)',
  })
  @ApiResponse({ status: 201, description: 'User registered successfully' })
  @ApiResponse({
    status: 400,
    description: 'Email already exists or invalid data',
  })
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

  @Post('/login')
  @Public()
  @ApiOperation({
    summary: 'Login user',
    description: 'Đăng nhập bằng email và mật khẩu',
  })
  @ApiResponse({
    status: 200,
    description: 'Login successful. Return access and refresh token',
  })
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

  @Delete('/logout')
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: 'Logout',
    description: 'Đăng xuất người dùng, thu hồi access token hiện tại',
  })
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
