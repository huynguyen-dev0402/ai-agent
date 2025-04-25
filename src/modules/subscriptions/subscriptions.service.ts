import { Subscription } from 'src/modules/subscriptions/entities/subscription.entity';
import { Injectable } from '@nestjs/common';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import { UpdateSubscriptionDto } from './dto/update-subscription.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class SubscriptionsService {
  constructor(
    @InjectRepository(Subscription)
    private readonly subscriptionRepository: Repository<Subscription>,
  ) {}
  create(createSubscriptionDto: CreateSubscriptionDto) {
    return 'This action adds a new subscription';
  }

  async findAll() {
    const subscriptions = await this.subscriptionRepository.find({
      relations: {
        subscription_features: {
          feature: true,
        },
      },
      select: {
        subscription_features: {
          id: true,
          feature: {
            id: true,
            name: true,
            description: true,
          },
        },
      },
    });
    return subscriptions;
  }

  findOne(id: number) {
    return `This action returns a #${id} subscription`;
  }

  update(id: number, updateSubscriptionDto: UpdateSubscriptionDto) {
    return `This action updates a #${id} subscription`;
  }

  remove(id: number) {
    return `This action removes a #${id} subscription`;
  }
}
