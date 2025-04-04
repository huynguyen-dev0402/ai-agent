import { Test, TestingModule } from '@nestjs/testing';
import { ChatbotOnboardingService } from './chatbot-onboarding.service';

describe('ChatbotOnboardingService', () => {
  let service: ChatbotOnboardingService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ChatbotOnboardingService],
    }).compile();

    service = module.get<ChatbotOnboardingService>(ChatbotOnboardingService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
