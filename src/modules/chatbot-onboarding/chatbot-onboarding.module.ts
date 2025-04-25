import { Module } from '@nestjs/common';
import { ChatbotOnboardingService } from './chatbot-onboarding.service';
import { ChatbotOnboardingController } from './chatbot-onboarding.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatbotOnboarding } from './entities/chatbot-onboarding.entity';
import { Chatbot } from '../chatbots/entities/chatbot.entity';
import { OnboardingSuggestedQuestion } from '../onboarding-suggested-questions/entities/onboarding-suggested-question.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ChatbotOnboarding,
      Chatbot,
      OnboardingSuggestedQuestion,
    ]),
  ],
  controllers: [ChatbotOnboardingController],
  providers: [ChatbotOnboardingService],
})
export class ChatbotOnboardingModule {}
