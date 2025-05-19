import {
  Injectable,
  InternalServerErrorException,
  BadRequestException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GenerateQRDto } from './dto/generate-qr.dto';
import { SePayWebhookDto } from './dto/webhook.dto';

@Injectable()
export class TransactionsService {
  constructor(private readonly configService: ConfigService) {}

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

    // Tạo mô tả chuyển khoản, ví dụ SUB-<subscription_id>-<nội dung>
    const encodedDescription = encodeURIComponent(
      `SEVQR-${generateQrDto.subscription_id}-${generateQrDto.des}`,
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
    return sePayWebhookDto;
  }
}
