import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  BadRequestException,
  ValidationPipe,
  HttpCode,
} from '@nestjs/common';
import { SubscriptionsService } from '@modules/subscriptions/subscriptions.service';
import { CreateSubscriptionDto } from '@modules/subscriptions/dto/create-subscription.dto';
import { UpdateSubscriptionDto } from '@modules/subscriptions/dto/update-subscription.dto';
import { SuperAdminGuard } from '@modules/author/guards/super-admin.guard';
import { AuthGuard } from '@modules/auth/guards/jwt-auth.guard';
import { ApiBody, ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';
import { UserSubscriptionsService } from '@modules/user-subscriptions/user-subscriptions.service';
import { ActionSubscriptionDto } from '@modules/subscriptions/dto/action-subscription.dto';
import { UserSubscriptions } from '@modules/user-subscriptions/entities/user-subscriptions.entity';
import { successResponse } from '@common/utils/response/response.util';
import { Public } from '@common/decorators/public-route.decorator';

@Controller('subscriptions')
@UseGuards(AuthGuard)
export class SubscriptionsController {
  constructor(
    private readonly subscriptionsService: SubscriptionsService,
    private readonly userSubscriptionService: UserSubscriptionsService,
  ) {}

  @UseGuards(SuperAdminGuard)
  @Post()
  async createSubscription(
    @Body() createSubscriptionDto: CreateSubscriptionDto,
  ) {
    return this.subscriptionsService.create(createSubscriptionDto);
  }

  @Post('subscribe')
  @HttpCode(201)
  @ApiOperation({ summary: 'Assign a subscription package to a user' })
  @ApiBody({ type: ActionSubscriptionDto })
  @ApiResponse({
    status: 201,
    description: 'Subscription has been successfully assigned to the user.',
    type: UserSubscriptions,
  })
  @ApiResponse({
    status: 400,
    description:
      'Invalid request (e.g., user already has an active subscription, invalid userId or subscriptionId).',
  })
  @ApiResponse({
    status: 404,
    description: 'User or subscription not found.',
  })
  @ApiResponse({
    status: 403,
    description:
      'User is not authorized to perform this action (e.g., user is inactive).',
  })
  async subscribeSubscription(
    @Body(new ValidationPipe()) subscribeDto: ActionSubscriptionDto,
  ) {
    if (!subscribeDto.subscriptionId) {
      throw new BadRequestException('subscriptionId cannot be empty.');
    }
    const response = await this.userSubscriptionService.subscribe(
      subscribeDto.userId,
      subscribeDto.subscriptionId,
    );

    if (!response) {
      throw new BadRequestException('Cannot subscribe subscription');
    }

    return successResponse('Subscription assigned successfully.', response);
  }

  @Post('upgrade')
  @HttpCode(201)
  @ApiOperation({
    summary: 'Upgrade the current subscription package of a user',
  })
  @ApiBody({ type: ActionSubscriptionDto })
  @ApiResponse({
    status: 201,
    description: 'Subscription has been successfully upgraded.',
    type: UserSubscriptions,
  })
  @ApiResponse({
    status: 400,
    description:
      'Invalid request (e.g., no active subscription to upgrade, same subscription selected).',
  })
  @ApiResponse({
    status: 404,
    description: 'User or new subscription not found.',
  })
  @ApiResponse({
    status: 403,
    description:
      'User is not authorized to perform this action (e.g., user is inactive).',
  })
  async upgradeSubscription(
    @Body(new ValidationPipe()) upgradeDto: ActionSubscriptionDto,
  ) {
    if (!upgradeDto.subscriptionId) {
      throw new BadRequestException('subscriptionId cannot be empty.');
    }
    const response = await this.userSubscriptionService.upgradeSubscription(
      upgradeDto.userId,
      upgradeDto.subscriptionId!,
    );

    if (!response) {
      throw new BadRequestException('Cannot upgrade subscription');
    }

    return successResponse('Subscription upgraded successfully.');
  }

  @Post('renew')
  @HttpCode(201)
  @ApiOperation({ summary: 'Renew an expired subscription package for a user' })
  @ApiBody({ type: ActionSubscriptionDto })
  @ApiResponse({
    status: 201,
    description: 'Subscription has been successfully renewed.',
    type: UserSubscriptions,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid request (e.g., no expired subscription to renew).',
  })
  @ApiResponse({
    status: 404,
    description: 'User or subscription not found.',
  })
  @ApiResponse({
    status: 403,
    description:
      'User is not authorized to perform this action (e.g., user is inactive).',
  })
  async renewSubscription(
    @Body(new ValidationPipe()) renewDto: ActionSubscriptionDto,
  ) {
    const response = await this.userSubscriptionService.renewSubscription(
      renewDto.userId,
    );

    if (!response) {
      throw new BadRequestException('Cannot renew subscription');
    }

    return successResponse('Subscription renewed successfully.');
  }

  @Post('cancel')
  @HttpCode(200)
  @ApiOperation({ summary: 'Cancel the current active subscription of a user' })
  @ApiBody({ type: ActionSubscriptionDto })
  @ApiResponse({
    status: 200,
    description: 'Subscription has been successfully canceled.',
    type: UserSubscriptions,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid request (e.g., no active subscription to cancel).',
  })
  @ApiResponse({
    status: 404,
    description: 'User not found.',
  })
  @ApiResponse({
    status: 403,
    description:
      'User is not authorized to perform this action (e.g., user is inactive).',
  })
  async cancelSubscription(
    @Body(new ValidationPipe()) cancelDto: ActionSubscriptionDto,
  ) {
    const response = await this.userSubscriptionService.cancelSubscription(
      cancelDto.userId,
    );

    if (!response) {
      throw new BadRequestException('Cannot cancel subscription');
    }

    return successResponse('Subscription canceled successfully.');
  }

  @Get()
  @Public()
  findAll() {
    return this.subscriptionsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.subscriptionsService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateSubscriptionDto: UpdateSubscriptionDto,
  ) {
    return this.subscriptionsService.update(+id, updateSubscriptionDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.subscriptionsService.remove(+id);
  }
}
