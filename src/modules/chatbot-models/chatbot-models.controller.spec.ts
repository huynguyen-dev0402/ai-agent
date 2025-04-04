import { Test, TestingModule } from '@nestjs/testing';
import { ChatbotModelsController } from './chatbot-models.controller';
import { ChatbotModelsService } from './chatbot-models.service';

describe('ChatbotModelsController', () => {
  let controller: ChatbotModelsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ChatbotModelsController],
      providers: [ChatbotModelsService],
    }).compile();

    controller = module.get<ChatbotModelsController>(ChatbotModelsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
