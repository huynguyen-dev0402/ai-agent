import { Module } from '@nestjs/common';
import { PasswordResetService } from './password-reset.service';
import { PasswordResetController } from './password-reset.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PasswordReset } from './entities/password-reset.entity';
import { BullModule } from '@nestjs/bullmq';
import { UsersModule } from '../users/users.module';
import { MailModule } from '../emails/email.module';
import { MailQueueModule } from '../mail-queue/mail-queue.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([PasswordReset]),
    UsersModule,
    MailModule,
    MailQueueModule,
  ],
  controllers: [PasswordResetController],
  providers: [PasswordResetService],
})
export class PasswordResetModule {}
