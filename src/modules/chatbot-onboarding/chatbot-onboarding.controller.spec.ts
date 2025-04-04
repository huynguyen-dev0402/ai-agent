import { Test, TestingModule } from '@nestjs/testing';
import { ChatbotOnboardingController } from './chatbot-onboarding.controller';
import { ChatbotOnboardingService } from './chatbot-onboarding.service';

describe('ChatbotOnboardingController', () => {
  let controller: ChatbotOnboardingController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ChatbotOnboardingController],
      providers: [ChatbotOnboardingService],
    }).compile();

    controller = module.get<ChatbotOnboardingController>(ChatbotOnboardingController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
