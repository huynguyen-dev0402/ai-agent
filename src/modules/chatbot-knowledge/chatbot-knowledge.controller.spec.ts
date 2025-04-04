import { Test, TestingModule } from '@nestjs/testing';
import { ChatbotKnowledgeController } from './chatbot-knowledge.controller';
import { ChatbotKnowledgeService } from './chatbot-knowledge.service';

describe('ChatbotKnowledgeController', () => {
  let controller: ChatbotKnowledgeController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ChatbotKnowledgeController],
      providers: [ChatbotKnowledgeService],
    }).compile();

    controller = module.get<ChatbotKnowledgeController>(ChatbotKnowledgeController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
