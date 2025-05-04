import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatbotOnboardingService } from '@modules/chatbot-onboarding/chatbot-onboarding.service';
import { ChatbotOnboardingController } from '@modules/chatbot-onboarding/chatbot-onboarding.controller';
import { ChatbotOnboarding } from '@modules/chatbot-onboarding/entities/chatbot-onboarding.entity';
import { Chatbot } from '@modules/chatbots/entities/chatbot.entity';
import { OnboardingSuggestedQuestion } from '@modules/onboarding-suggested-questions/entities/onboarding-suggested-question.entity';

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
