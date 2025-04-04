import { Module } from '@nestjs/common';
import { ChatbotKnowledgeService } from './chatbot-knowledge.service';
import { ChatbotKnowledgeController } from './chatbot-knowledge.controller';

@Module({
  controllers: [ChatbotKnowledgeController],
  providers: [ChatbotKnowledgeService],
})
export class ChatbotKnowledgeModule {}
