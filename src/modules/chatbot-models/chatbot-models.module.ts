import { Module } from '@nestjs/common';
import { ChatbotModelsService } from './chatbot-models.service';
import { ChatbotModelsController } from './chatbot-models.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatbotModel } from './entities/chatbot-model.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ChatbotModel])],
  controllers: [ChatbotModelsController],
  providers: [ChatbotModelsService],
  exports: [ChatbotModelsService],
})
export class ChatbotModelsModule {}
