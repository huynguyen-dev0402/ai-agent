import { Module } from '@nestjs/common';
import { ChatbotConfigsService } from './chatbot-configs.service';
import { ChatbotConfigsController } from './chatbot-configs.controller';

@Module({
  controllers: [ChatbotConfigsController],
  providers: [ChatbotConfigsService],
})
export class ChatbotConfigsModule {}
