import { Module } from '@nestjs/common';
import { ChatbotPromptService } from './chatbot-prompt.service';
import { ChatbotPromptController } from './chatbot-prompt.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatbotPrompt } from './entities/chatbot-prompt.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ChatbotPrompt])],
  controllers: [ChatbotPromptController],
  providers: [ChatbotPromptService],
})
export class ChatbotPromptModule {}
