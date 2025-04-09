import { Test, TestingModule } from '@nestjs/testing';
import { ChatbotPromptController } from './chatbot-prompt.controller';
import { ChatbotPromptService } from './chatbot-prompt.service';

describe('ChatbotPromptController', () => {
  let controller: ChatbotPromptController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ChatbotPromptController],
      providers: [ChatbotPromptService],
    }).compile();

    controller = module.get<ChatbotPromptController>(ChatbotPromptController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
