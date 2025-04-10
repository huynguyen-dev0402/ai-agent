import { Module } from '@nestjs/common';
import { ChatbotPromptService } from './chatbot-prompt.service';
import { ChatbotPromptController } from './chatbot-prompt.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatbotPrompt } from './entities/chatbot-prompt.entity';
import { Resource } from '../resources/entities/resource.entity';
import { User } from '../users/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ChatbotPrompt, Resource, User])],
  controllers: [ChatbotPromptController],
  providers: [ChatbotPromptService],
  exports: [ChatbotPromptService],
})
export class ChatbotPromptModule {}
