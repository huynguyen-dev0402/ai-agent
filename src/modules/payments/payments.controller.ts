import { BadRequestException, Body, Controller, Post, Redirect, Req } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { firstValueFrom } from 'rxjs';
import { UserSubscriptionsService } from '@modules/user-subscriptions/user-subscriptions.service';
import { Request } from 'express';

@Controller('payments')
export class PaymentsController {
  constructor(
    private readonly paymentsService: PaymentsService,
    private readonly userSubscriptionsService: UserSubscriptionsService,
  ) {}
  // @Post('sepay/initiate')
  // @Redirect()
  // async initiateSepayPayment(
  //   @Body() body: { subscriptionId: string },
  //   @Req() req: Request & { user: { [key: string]: string } },
  // ) {
  //   const { subscriptionId } = body;

  //   try {
  //     const { paymentUrl } = await this.paymentsService.initiateSepayPayment(
  //       subscriptionId,
  //       req.user.id,
  //     );
  //     return { url: paymentUrl };
  //   } catch (error) {
  //     throw new BadRequestException(error.message);
  //   }
  // }
}
