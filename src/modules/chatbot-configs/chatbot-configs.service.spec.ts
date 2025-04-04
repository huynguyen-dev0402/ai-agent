import { Test, TestingModule } from '@nestjs/testing';
import { ChatbotConfigsService } from './chatbot-configs.service';

describe('ChatbotConfigsService', () => {
  let service: ChatbotConfigsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ChatbotConfigsService],
    }).compile();

    service = module.get<ChatbotConfigsService>(ChatbotConfigsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
