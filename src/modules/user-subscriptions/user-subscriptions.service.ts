import { Injectable } from '@nestjs/common';
import {
  UserSubscriptions,
  SubscriptionStatus,
} from './entities/user-subscriptions.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { UserStatus } from '../users/entities/user.entity';

@Injectable()
export class UserSubscriptionsService {
  constructor(
    @InjectRepository(UserSubscriptions)
    private readonly userSubRepository: Repository<UserSubscriptions>,
  ) {}
  async findOneForUser(userId: string) {
    const subscription = await this.userSubRepository.findOne({
      where: {
        user: {
          id: userId,
        },
        status: SubscriptionStatus.ACTIVE,
      },
      relations: {
        subscription: true,
      },
    });
    return subscription;
  }
}
