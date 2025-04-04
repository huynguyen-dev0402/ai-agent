import { Module } from '@nestjs/common';
import { ChatbotOnboardingService } from './chatbot-onboarding.service';
import { ChatbotOnboardingController } from './chatbot-onboarding.controller';

@Module({
  controllers: [ChatbotOnboardingController],
  providers: [ChatbotOnboardingService],
})
export class ChatbotOnboardingModule {}
