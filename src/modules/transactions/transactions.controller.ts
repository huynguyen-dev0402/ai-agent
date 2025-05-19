import {
  Body,
  Controller,
  HttpCode,
  HttpException,
  HttpStatus,
  InternalServerErrorException,
  Logger,
  Post,
  Req,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Request } from 'express';
import { TransactionsService } from './transactions.service';
import { GenerateQRDto } from './dto/generate-qr.dto';
import { UserIdMatchGuard } from '@common/guards/user-id-match.guard';
import { WebhookUtils } from '@common/utils/webhook/webhook.util';
import { SePayWebhookDto } from './dto/webhook.dto';
import { Public } from '@common/decorators/public-route.decorator';

@ApiTags('transactions')
@Controller('transactions')
export class TransactionsController {
  private readonly logger = new Logger(TransactionsController.name);

  constructor(
    private readonly transactionsService: TransactionsService,
    private readonly configService: ConfigService,
    private readonly webhookUtils: WebhookUtils,
  ) {
    // Fail fast if API key is not configured
    const apiKey = this.configService.get<string>('SEPAY_WEBHOOK_API_KEY');
    if (!apiKey) {
      this.logger.error('SEPAY_WEBHOOK_API_KEY is not configured');
      throw new Error('SEPAY_WEBHOOK_API_KEY is not configured');
    }
  }

  @Post('/generate-qr')
  //@UseGuards(UserIdMatchGuard)
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
  //@UseGuards(UserIdMatchGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Handle SePay payment webhook' })
  @ApiBearerAuth()
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Webhook processed successfully',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid payload',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Invalid or missing authorization',
  })
  @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Invalid API key' })
  async payment(
    @Body(new ValidationPipe()) sePayWebhookDto: SePayWebhookDto,
    @Req() req: Request,
  ) {
    try {
      // Validate webhook payload
      if (!sePayWebhookDto || Object.keys(sePayWebhookDto).length === 0) {
        this.logger.warn('Empty webhook payload received');
        throw new HttpException('Invalid payload', HttpStatus.BAD_REQUEST);
      }

      // Validate and process webhook
      const authHeader = req.headers[
        this.webhookUtils.API_KEY_HEADER.toLowerCase()
      ] as string;
      const apiKey = this.configService.get<string>('SEPAY_WEBHOOK_API_KEY')!;
      await this.webhookUtils.validateWebhookAuth(authHeader, apiKey);

      // Process payment
      this.logger.log('Processing SePay payment webhook');
      const result =
        await this.transactionsService.processSePayTransaction(sePayWebhookDto);
      return {
        success: true,
        data: result,
      };
    } catch (error) {
      this.logger.error(`Webhook processing failed: ${error.message}`);
      throw error instanceof HttpException
        ? error
        : new InternalServerErrorException('Failed to process webhook');
    }
  }
}
