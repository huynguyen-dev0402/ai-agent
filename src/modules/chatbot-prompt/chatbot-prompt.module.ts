import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Resource } from '@modules/resources/entities/resource.entity';
import { User } from '@modules/users/entities/user.entity';
import { ChatbotPromptService } from '@modules/chatbot-prompt/chatbot-prompt.service';
import { ChatbotPromptController } from '@modules/chatbot-prompt/chatbot-prompt.controller';
import { ChatbotPrompt } from '@modules/chatbot-prompt/entities/chatbot-prompt.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ChatbotPrompt, Resource, User])],
  controllers: [ChatbotPromptController],
  providers: [ChatbotPromptService],
  exports: [ChatbotPromptService],
})
export class ChatbotPromptModule {}
