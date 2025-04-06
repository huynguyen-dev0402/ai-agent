import { Test, TestingModule } from '@nestjs/testing';
import { ChatbotPublishedService } from './chatbot_published.service';

describe('ChatbotPublishedService', () => {
  let service: ChatbotPublishedService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ChatbotPublishedService],
    }).compile();

    service = module.get<ChatbotPublishedService>(ChatbotPublishedService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
