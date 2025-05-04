import { Test, TestingModule } from '@nestjs/testing';
import { ChatbotTokensController } from './chatbot-tokens.controller';
import { ChatbotTokensService } from './chatbot-tokens.service';

describe('ChatbotTokensController', () => {
  let controller: ChatbotTokensController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ChatbotTokensController],
      providers: [ChatbotTokensService],
    }).compile();

    controller = module.get<ChatbotTokensController>(ChatbotTokensController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
