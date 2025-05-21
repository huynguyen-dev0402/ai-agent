import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  InternalServerErrorException,
  HttpException,
  Req,
  Sse,
  Logger,
  Param,
} from '@nestjs/common';
import { Request } from 'express';
import { ValidationPipe } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { TransactionsService } from './transactions.service';
import { GenerateQRDto } from './dto/generate-qr.dto';
import { SePayWebhookDto } from './dto/webhook.dto';
import { ConfigService } from '@nestjs/config';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Observable, fromEvent } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { Public } from '@common/decorators/public-route.decorator';

@Controller('transactions')
export class TransactionsController {
  private readonly logger = new Logger(TransactionsController.name);

  constructor(
    private readonly transactionsService: TransactionsService,
    private readonly configService: ConfigService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  @Post('/generate-qr')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Generate QR code for payment' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'QR code generated successfully',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid input data',
  })
  async generateQR(@Body(new ValidationPipe()) generateQrDto: GenerateQRDto) {
    try {
      this.logger.log('Generating QR code');
      const qr = await this.transactionsService.generateQR(generateQrDto);
      return {
        success: true,
        data: qr,
      };
    } catch (error) {
      this.logger.error(`Failed to generate QR code: ${error.message}`);
      throw error instanceof HttpException
        ? error
        : new InternalServerErrorException('Failed to generate QR code');
    }
  }

  @Post()
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Handle SePay payment webhook' })
  @ApiBearerAuth()
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Webhook queued successfully',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid payload',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Invalid or missing authorization',
  })
  async payment(
    @Body(new ValidationPipe()) sePayWebhookDto: SePayWebhookDto,
    @Req() req: Request,
  ) {
    try {
      if (!sePayWebhookDto || Object.keys(sePayWebhookDto).length === 0) {
        this.logger.warn('Empty webhook payload received');
        throw new HttpException('Invalid payload', HttpStatus.BAD_REQUEST);
      }

      const authHeader = req.headers['authorization'] as string;
      const apiKey = this.configService.get<string>('SEPAY_WEBHOOK_API_KEY');
      if (!authHeader || authHeader !== `Bearer ${apiKey}`) {
        throw new HttpException('Invalid API key', HttpStatus.UNAUTHORIZED);
      }

      this.logger.log('Queuing SePay payment webhook');
      const result =
        await this.transactionsService.queueSePayWebhook(sePayWebhookDto);
      return result;
    } catch (error) {
      this.logger.error(`Webhook queuing failed: ${error.message}`);
      throw error instanceof HttpException
        ? error
        : new InternalServerErrorException('Failed to queue webhook');
    }
  }

  @Sse('payment-status/:userId')
  @Public()
  @ApiOperation({ summary: 'Subscribe to payment status updates' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'SSE stream for payment status updates',
  })
  ssePaymentStatus(@Param('userId') userId: string): Observable<any> {
    return fromEvent(this.eventEmitter, 'payment.status').pipe(
      map((data: any) => {
        if (data.userId === userId) {
          return {
            data: {
              subscriptionId: data.subscriptionId,
              status: data.status,
              orderId: data.orderId,
            },
          };
        }
        return null;
      }),
      filter((data) => data !== null),
    );
  }
}
