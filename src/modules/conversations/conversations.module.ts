import {  Module } from '@nestjs/common';
import { ConversationsService } from './conversations.service';
import { ConversationsController } from './conversations.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Conversation } from './entities/conversation.entity';
import { MessagesModule } from '../messages/messages.module';
import { Message } from '../messages/entities/message.entity';
import { ChatbotsModule } from '../chatbots/chatbots.module';
import { EndUser } from '../end-users/entities/end-user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Conversation, Message, EndUser]),
    MessagesModule,
    ChatbotsModule,
  ],
  controllers: [ConversationsController],
  providers: [ConversationsService],
  exports: [ConversationsService],
})
export class ConversationsModule {}
