import { Module } from '@nestjs/common';
import { ChatbotModelsService } from './chatbot-models.service';
import { ChatbotModelsController } from './chatbot-models.controller';

@Module({
  controllers: [ChatbotModelsController],
  providers: [ChatbotModelsService],
})
export class ChatbotModelsModule {}
