import {
  Injectable,
  InternalServerErrorException,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GenerateQRDto } from './dto/generate-qr.dto';
import { SePayWebhookDto } from './dto/webhook.dto';
import { SubscriptionsService } from '@modules/subscriptions/subscriptions.service';
import { SubscriptionStatus, UserSubscriptions } from '@modules/user-subscriptions/entities/user-subscriptions.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class TransactionsService {
  constructor(
    private readonly configService: ConfigService,
    private readonly subscriptionService: SubscriptionsService,
    @InjectRepository(UserSubscriptions)
    private readonly userSubRepository: Repository<UserSubscriptions>,
  ) {}

  async generateQR(
    generateQrDto: GenerateQRDto,
  ): Promise<{ qrImageUrl: string }> {
    const acc = this.configService.get<string>('ACCOUNT');
    const bank = this.configService.get<string>('BANK');

    // Kiểm tra ENV
    if (!acc) {
      throw new InternalServerErrorException(
        'Environment variable ACCOUNT is not set.',
      );
    }
    if (!bank) {
      throw new InternalServerErrorException(
        'Environment variable BANK is not set.',
      );
    }

    // Validate dữ liệu nghiệp vụ nếu cần
    if (generateQrDto.amount <= 0) {
      throw new BadRequestException('Amount must be greater than zero.');
    }

    const subsription = await this.subscriptionService.findOne(
      generateQrDto.subscription_id,
    );
    if (!subsription) {
      throw new NotFoundException('Subscription not found');
    }

    const userSub = await this.userSubRepository.findOne({
      where: {
        user: { id: generateQrDto.user_id },
        subscription: { id: generateQrDto.subscription_id },
        status: SubscriptionStatus.PENDING,
      },
    });
    if (!userSub) {
      throw new NotFoundException('User subscription not found');
    }

    if (userSub) {
      throw new BadRequestException('User subscription not found');
    }
    // Tạo mô tả chuyển khoản, ví dụ SUB<subscription_code>
    const encodedDescription = encodeURIComponent(
      `SEVQR${subsription.subscription_code}`,
    );

    // Khởi tạo query params
    const params = new URLSearchParams({
      acc,
      bank,
      amount: generateQrDto.amount.toString(),
      des: encodedDescription,
      template: generateQrDto.template,
    });

    if (generateQrDto?.download) {
      params.append('download', generateQrDto.download);
    }

    const qrImageUrl = `https://qr.sepay.vn/img?${params.toString()}`;

    return { qrImageUrl };
  }

  async processSePayTransaction(sePayWebhookDto: SePayWebhookDto) {
    console.log(sePayWebhookDto);
    return sePayWebhookDto;
  }
}
