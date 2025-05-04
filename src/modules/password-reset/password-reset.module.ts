import { Module } from '@nestjs/common';
import { PasswordResetService } from '@modules/password-reset/password-reset.service';
import { PasswordResetController } from '@modules/password-reset/password-reset.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PasswordReset } from '@modules/password-reset/entities/password-reset.entity';
import { UsersModule } from '@modules/users/users.module';
import { MailModule } from '@modules/emails/email.module';
import { MailQueueModule } from '@modules/mail-queue/mail-queue.module';

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
