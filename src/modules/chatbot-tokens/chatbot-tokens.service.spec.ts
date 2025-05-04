import { Test, TestingModule } from '@nestjs/testing';
import { ChatbotTokensService } from './chatbot-tokens.service';

describe('ChatbotTokensService', () => {
  let service: ChatbotTokensService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ChatbotTokensService],
    }).compile();

    service = module.get<ChatbotTokensService>(ChatbotTokensService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
