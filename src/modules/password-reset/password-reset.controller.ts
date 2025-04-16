import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  BadRequestException,
  ValidationPipe,
} from '@nestjs/common';
import { PasswordResetService } from './password-reset.service';
import { CreatePasswordResetDto } from './dto/create-password-reset.dto';
import { UpdatePasswordResetDto } from './dto/update-password-reset.dto';
import { successResponse } from 'src/utils/response/response.util';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';

@Controller('auth')
export class PasswordResetController {
  constructor(private readonly passwordResetService: PasswordResetService) {}
  @Post('forgot-password')
  async request(
    @Body(new ValidationPipe()) forgotPasswordDto: ForgotPasswordDto,
  ) {
    const data =
      await this.passwordResetService.requestReset(forgotPasswordDto);
    if (!data) {
      throw new BadRequestException('Cannot request reset password');
    }
    return successResponse('Request reset password success');
  }

  @Post('verify-otp')
  async verify(@Body(new ValidationPipe()) verifyOtpDto: VerifyOtpDto) {
    const data = await this.passwordResetService.verifyOtp(verifyOtpDto);
    if (!data) {
      throw new BadRequestException('Cannot verify OTP');
    }
    return successResponse('Verify OTP success');
  }

  @Post('reset-password')
  async reset(@Body(new ValidationPipe()) resetPasswordDto: ResetPasswordDto) {
    const data =
      await this.passwordResetService.resetPassword(resetPasswordDto);
    if (!data) {
      throw new BadRequestException('Cannot reset password');
    }
    return successResponse('Reset password success');
  }

  @Post()
  create(@Body() createPasswordResetDto: CreatePasswordResetDto) {
    return this.passwordResetService.create(createPasswordResetDto);
  }

  @Get()
  findAll() {
    return this.passwordResetService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.passwordResetService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updatePasswordResetDto: UpdatePasswordResetDto,
  ) {
    return this.passwordResetService.update(+id, updatePasswordResetDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.passwordResetService.remove(+id);
  }
}
