import { Injectable } from '@nestjs/common';
import { CreateChatbotOnboardingDto } from './dto/create-chatbot-onboarding.dto';
import { UpdateChatbotOnboardingDto } from './dto/update-chatbot-onboarding.dto';

@Injectable()
export class ChatbotOnboardingService {
  create(createChatbotOnboardingDto: CreateChatbotOnboardingDto) {
    return 'This action adds a new chatbotOnboarding';
  }

  findAll() {
    return `This action returns all chatbotOnboarding`;
  }

  findOne(id: number) {
    return `This action returns a #${id} chatbotOnboarding`;
  }

  update(id: number, updateChatbotOnboardingDto: UpdateChatbotOnboardingDto) {
    return `This action updates a #${id} chatbotOnboarding`;
  }

  remove(id: number) {
    return `This action removes a #${id} chatbotOnboarding`;
  }
}
