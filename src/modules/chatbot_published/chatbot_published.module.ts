import { Module } from '@nestjs/common';
import { ChatbotPublishedService } from './chatbot_published.service';
import { ChatbotPublishedController } from './chatbot_published.controller';

@Module({
  controllers: [ChatbotPublishedController],
  providers: [ChatbotPublishedService],
})
export class ChatbotPublishedModule {}
