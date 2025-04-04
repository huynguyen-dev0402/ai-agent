import { Test, TestingModule } from '@nestjs/testing';
import { ChatbotConfigsController } from './chatbot-configs.controller';
import { ChatbotConfigsService } from './chatbot-configs.service';

describe('ChatbotConfigsController', () => {
  let controller: ChatbotConfigsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ChatbotConfigsController],
      providers: [ChatbotConfigsService],
    }).compile();

    controller = module.get<ChatbotConfigsController>(ChatbotConfigsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
