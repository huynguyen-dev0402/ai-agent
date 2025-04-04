import { Test, TestingModule } from '@nestjs/testing';
import { ChatbotModelsService } from './chatbot-models.service';

describe('ChatbotModelsService', () => {
  let service: ChatbotModelsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ChatbotModelsService],
    }).compile();

    service = module.get<ChatbotModelsService>(ChatbotModelsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
