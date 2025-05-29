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
  Get,
} from '@nestjs/common';
import { Request } from 'express';
import { ValidationPipe } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { TransactionsService } from './transactions.service';
import { GenerateQRDto } from './dto/generate-qr.dto';
import { SePayWebhookDto } from './dto/webhook.dto';
import { ConfigService } from '@nestjs/config';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Observable, fromEvent, throwError } from 'rxjs';
import { catchError, filter, map } from 'rxjs/operators';
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
    this.logger.log(`[generateQR] Start generating QR`);
    try {
      const qr = await this.transactionsService.generateQR(generateQrDto);
      this.logger.log(`[generateQR] QR generated successfully`);
      return { success: true, data: qr };
    } catch (error) {
      this.logger.error(`[generateQR] Failed: ${error.message}`);
      throw error instanceof HttpException
        ? error
        : new InternalServerErrorException('Failed to generate QR code');
    }
  }

  @Post('/cancel-payment')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Cancel a payment' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Payment canceled successfully',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid input data',
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'Failed to cancel payment',
  })
  async cancelPayment(
    @Req() request: Request & { user: { [key: string]: string } },
  ) {
    this.logger.log(
      `[cancelPayment] Canceling payment for user ${request.user.id}`,
    );
    try {
      const result = await this.transactionsService.cancelPayment(
        request.user.id,
      );
      this.logger.log(
        `[cancelPayment] Payment canceled for user ${request.user.id}`,
      );
      return { success: true, data: result };
    } catch (error) {
      this.logger.error(`[cancelPayment] Failed: ${error.message}`);
      throw error instanceof HttpException
        ? error
        : new InternalServerErrorException('Failed to cancel payment');
    }
  }

  @Get('')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get payment with status is pending' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Find payment with status is pending',
  })
  async findPaymentPending(
    @Req() request: Request & { user: { [key: string]: string } },
  ) {
    this.logger.log(
      `[findPaymentPending] Getting pending payment for user ${request.user.id}`,
    );
    try {
      const result = await this.transactionsService.getPaymentPending(
        request.user.id,
      );
      return { success: true, data: result };
    } catch (error) {
      this.logger.error(`[findPaymentPending] Failed: ${error.message}`);
      throw error instanceof HttpException
        ? error
        : new InternalServerErrorException('Failed to find payment');
    }
  }

  @Post('/subscribe-webhook')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Handle SePay payment webhook (subscribe)' })
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
  async paymentSubscribe(
    @Body(new ValidationPipe()) sePayWebhookDto: SePayWebhookDto,
    @Req() req: Request,
  ) {
    this.logger.log(`[paymentSubscribe] Received webhook`);
    try {
      if (!sePayWebhookDto || Object.keys(sePayWebhookDto).length === 0) {
        this.logger.warn(`[paymentSubscribe] Empty webhook payload`);
        throw new HttpException('Invalid payload', HttpStatus.BAD_REQUEST);
      }

      const authHeader = req.headers['authorization'] as string;
      const apiKey = this.configService.get<string>(
        'SUBSCRIBE_WEBHOOK_API_KEY',
      );
      if (!authHeader || authHeader !== `Apikey ${apiKey}`) {
        this.logger.warn(`[paymentSubscribe] Invalid or missing API key`);
        throw new HttpException('Invalid API key', HttpStatus.UNAUTHORIZED);
      }

      const result =
        await this.transactionsService.queueSubscribeSePayWebhook(
          sePayWebhookDto,
        );
      this.logger.log(`[paymentSubscribe] Webhook queued successfully`);
      return result;
    } catch (error) {
      this.logger.error(`[paymentSubscribe] Failed: ${error.message}`);
      throw error instanceof HttpException
        ? error
        : new InternalServerErrorException('Failed to queue webhook');
    }
  }

  @Post('/extend-webhook')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Handle SePay extend payment webhook' })
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
  async paymentExtend(
    @Body(new ValidationPipe()) sePayWebhookDto: SePayWebhookDto,
    @Req() req: Request,
  ) {
    this.logger.log(`[paymentExtend] Received webhook`);
    try {
      if (!sePayWebhookDto || Object.keys(sePayWebhookDto).length === 0) {
        this.logger.warn(`[paymentExtend] Empty webhook payload`);
        throw new HttpException('Invalid payload', HttpStatus.BAD_REQUEST);
      }

      const authHeader = req.headers['authorization'] as string;
      const apiKey = this.configService.get<string>('EXTEND_WEBHOOK_API_KEY');
      if (!authHeader || authHeader !== `Apikey ${apiKey}`) {
        this.logger.warn(`[paymentExtend] Invalid or missing API key`);
        throw new HttpException('Invalid API key', HttpStatus.UNAUTHORIZED);
      }

      const result =
        await this.transactionsService.queueExtendSePayWebhook(sePayWebhookDto);
      this.logger.log(`[paymentExtend] Webhook queued successfully`);
      return result;
    } catch (error) {
      this.logger.error(`[paymentExtend] Failed: ${error.message}`);
      throw error instanceof HttpException
        ? error
        : new InternalServerErrorException('Failed to queue webhook');
    }
  }

  @Post('/upgrade-webhook')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Handle SePay upgrade payment webhook' })
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
  async paymentUpgrade(
    @Body(new ValidationPipe()) sePayWebhookDto: SePayWebhookDto,
    @Req() req: Request,
  ) {
    this.logger.log(`[paymentUpgrade] Received webhook`);
    try {
      if (!sePayWebhookDto || Object.keys(sePayWebhookDto).length === 0) {
        this.logger.warn(`[paymentUpgrade] Empty webhook payload`);
        throw new HttpException('Invalid payload', HttpStatus.BAD_REQUEST);
      }

      const authHeader = req.headers['authorization'] as string;
      const apiKey = this.configService.get<string>('EXTEND_WEBHOOK_API_KEY');
      if (!authHeader || authHeader !== `Apikey ${apiKey}`) {
        this.logger.warn(`[paymentUpgrade] Invalid or missing API key`);
        throw new HttpException('Invalid API key', HttpStatus.UNAUTHORIZED);
      }

      const result =
        await this.transactionsService.queueUpgradeSePayWebhook(sePayWebhookDto);
      this.logger.log(`[paymentUpgrade] Webhook queued successfully`);
      return result;
    } catch (error) {
      this.logger.error(`[paymentUpgrade] Failed: ${error.message}`);
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
    this.logger.log(
      `[ssePaymentStatus] Start SSE stream for userId: ${userId}`,
    );

    return fromEvent(this.eventEmitter, 'payment.status').pipe(
      map((data: any) => {
        if (data.userId === userId) {
          const response = {
            data: {
              subscriptionId: data.subscriptionId,
              status: data.status,
              orderId: data.orderId,
            },
          };
          this.logger.debug(
            `[ssePaymentStatus] Emit status for userId: ${userId}, status: ${data.status}`,
          );
          return response;
        }
        return null;
      }),
      filter((data) => data !== null),
      catchError((error) => {
        this.logger.error(`[ssePaymentStatus] Error: ${error.message}`);
        return throwError(
          () =>
            new InternalServerErrorException('Failed to stream payment status'),
        );
      }),
    );
  }
}
// This controller handles payment-related operations such as generating QR codes,
// canceling payments, and handling webhooks from SePay. It also provides an SSE endpoint