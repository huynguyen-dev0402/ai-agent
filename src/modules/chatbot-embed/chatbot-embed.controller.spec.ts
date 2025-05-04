import { Test, TestingModule } from '@nestjs/testing';
import { ChatbotEmbedController } from './chatbot-embed.controller';
import { ChatbotEmbedService } from './chatbot-embed.service';

describe('ChatbotEmbedController', () => {
  let controller: ChatbotEmbedController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ChatbotEmbedController],
      providers: [ChatbotEmbedService],
    }).compile();

    controller = module.get<ChatbotEmbedController>(ChatbotEmbedController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
