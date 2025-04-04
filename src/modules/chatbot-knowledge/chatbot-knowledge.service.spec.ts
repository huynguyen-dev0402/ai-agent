import { Test, TestingModule } from '@nestjs/testing';
import { ChatbotKnowledgeService } from './chatbot-knowledge.service';

describe('ChatbotKnowledgeService', () => {
  let service: ChatbotKnowledgeService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ChatbotKnowledgeService],
    }).compile();

    service = module.get<ChatbotKnowledgeService>(ChatbotKnowledgeService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
