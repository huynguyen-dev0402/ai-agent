import { Test, TestingModule } from '@nestjs/testing';
import { ChatbotPromptService } from './chatbot-prompt.service';

describe('ChatbotPromptService', () => {
  let service: ChatbotPromptService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ChatbotPromptService],
    }).compile();

    service = module.get<ChatbotPromptService>(ChatbotPromptService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
