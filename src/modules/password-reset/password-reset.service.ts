import { CreatePasswordResetDto } from './dto/create-password-reset.dto';
import { UpdatePasswordResetDto } from './dto/update-password-reset.dto';
import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Queue } from 'bullmq';
import { InjectQueue } from '@nestjs/bullmq';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PasswordReset } from './entities/password-reset.entity';
import { UsersService } from '../users/users.service';
import { hashPassword } from 'src/utils/hash-password/hashing.util';
import { generateUniqueString } from 'src/utils/generate-random/generate-username.util';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';

@Injectable()
export class PasswordResetService {
  private readonly logger = new Logger(PasswordResetService.name);
  constructor(
    @InjectRepository(PasswordReset)
    private readonly resetRepo: Repository<PasswordReset>,
    @InjectQueue('mail') private mailQueue: Queue,
    private readonly userService: UsersService,
  ) {}
  @Cron(CronExpression.EVERY_MINUTE)
  async handleCron() {
    const now = new Date();
    const result = await this.resetRepo
      .createQueryBuilder()
      .delete()
      .from(PasswordReset)
      .where('expires_at < :now', { now })
      .execute();

    if (result.affected && result.affected > 0) {
      this.logger.log(
        `Deleted ${result.affected} expired password reset entries`,
      );
    }
  }

  async requestReset(forgotPasswordDto: ForgotPasswordDto) {
    const { email } = forgotPasswordDto;
    const otp = generateUniqueString('');
    const expires_at = new Date(Date.now() + 3 * 60 * 1000); // 3 min

    // Xóa bản ghi cũ nếu tồn tại
    await this.resetRepo.delete({ email });

    // Tạo và lưu bản ghi mới
    const reset = this.resetRepo.create({ email, otp, expires_at });
    await this.resetRepo.save(reset);

    // Gửi mail qua queue
    await this.mailQueue.add(
      'send-otp',
      {
        to: email,
        subject: 'Mã xác thực đặt lại mật khẩu',
        otp,
      },
      {
        attempts: 3, // thử lại 3 lần nếu lỗi
        backoff: {
          type: 'exponential',
          delay: 3000, // 3s
        },
        removeOnComplete: true, // tự xóa nếu thành công (default)
        removeOnFail: false, // giữ lại job lỗi để kiểm tra log
      },
    );

    return true;
  }

  async verifyOtp(verifyOtpDto: VerifyOtpDto) {
    const { email, otp } = verifyOtpDto;
    const record = await this.resetRepo.findOne({ where: { email, otp } });

    if (!record) throw new NotFoundException('Incorrect OTP');
    if (record.expires_at < new Date())
      throw new BadRequestException('OTP expired');

    return true;
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto) {
    const { email, new_password } = resetPasswordDto;
    const exsistEmail = await this.resetRepo.findOne({
      where: {
        email,
      },
    });
    if (!exsistEmail) {
      throw new NotFoundException('Email not found');
    }
    const password = hashPassword(new_password);
    // TODO: update password for user
    const response = await this.userService.updatePassword(email, password);
    if (!response) {
      throw new BadRequestException('Cannot update password for user');
    }

    // Remove OTP used
    await this.resetRepo.delete(email);

    return true;
  }

  create(createPasswordResetDto: CreatePasswordResetDto) {
    return 'This action adds a new passwordReset';
  }

  findAll() {
    return `This action returns all passwordReset`;
  }

  findOne(id: number) {
    return `This action returns a #${id} passwordReset`;
  }

  update(id: number, updatePasswordResetDto: UpdatePasswordResetDto) {
    return `This action updates a #${id} passwordReset`;
  }

  remove(id: number) {
    return `This action removes a #${id} passwordReset`;
  }
}
