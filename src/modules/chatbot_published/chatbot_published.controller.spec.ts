import { Test, TestingModule } from '@nestjs/testing';
import { ChatbotPublishedController } from './chatbot_published.controller';
import { ChatbotPublishedService } from './chatbot_published.service';

describe('ChatbotPublishedController', () => {
  let controller: ChatbotPublishedController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ChatbotPublishedController],
      providers: [ChatbotPublishedService],
    }).compile();

    controller = module.get<ChatbotPublishedController>(ChatbotPublishedController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
