import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { AuthGuard } from '@modules/auth/guards/jwt-auth.guard';
import { Payment } from './entities/payment.entity';
import { GetPaymentsQueryDto } from './dto/get-payment-query.dto';

@Controller('payments')
@UseGuards(AuthGuard)
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Get('/:id')
  getPaymentById(@Param('id') id: string): Promise<Payment | null> {
    if (!id) {
      throw new BadRequestException('Payment ID is required');
    }
    return this.paymentsService.getPaymentById(id);
  }

  @Get('/')
  getPaymentsByUserId(@Query() query: GetPaymentsQueryDto): Promise<Payment[]> {
    if (!query.userId) {
      throw new BadRequestException('User ID is required');
    }
    return this.paymentsService.getPaymentsByUserId(query.userId, query);
  }
}
