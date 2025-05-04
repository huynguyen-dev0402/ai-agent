import { Test, TestingModule } from '@nestjs/testing';
import { ChatbotEmbedService } from './chatbot-embed.service';

describe('ChatbotEmbedService', () => {
  let service: ChatbotEmbedService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ChatbotEmbedService],
    }).compile();

    service = module.get<ChatbotEmbedService>(ChatbotEmbedService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
