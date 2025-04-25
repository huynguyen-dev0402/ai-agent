import { Module } from '@nestjs/common';
import { ChatbotModelsService } from './chatbot-models.service';
import { ChatbotModelsController } from './chatbot-models.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatbotModel } from './entities/chatbot-model.entity';
import { Chatbot } from '../chatbots/entities/chatbot.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ChatbotModel, Chatbot])],
  controllers: [ChatbotModelsController],
  providers: [ChatbotModelsService],
  exports: [ChatbotModelsService],
})
export class ChatbotModelsModule {}
