import { Module } from '@nestjs/common';
import { MessagesService } from './messages.service';
import { MessagesController } from './messages.controller';
import { Message } from './entities/message.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Chatbot } from '../chatbots/entities/chatbot.entity';
import { Conversation } from '../conversations/entities/conversation.entity';
import { User } from '../users/entities/user.entity';
import { EndUser } from '../end-users/entities/end-user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Message, Conversation, Chatbot, User, EndUser]),
  ],
  controllers: [MessagesController],
  providers: [MessagesService],
  exports: [MessagesService],
})
export class MessagesModule {}
