import { Module } from '@nestjs/common';
import { ChatbotModelsService } from '@modules/chatbot-models/chatbot-models.service';
import { ChatbotModelsController } from '@modules/chatbot-models/chatbot-models.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatbotModel } from '@modules/chatbot-models/entities/chatbot-model.entity';
import { Chatbot } from '@modules/chatbots/entities/chatbot.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ChatbotModel, Chatbot])],
  controllers: [ChatbotModelsController],
  providers: [ChatbotModelsService],
  exports: [ChatbotModelsService],
})
export class ChatbotModelsModule {}
