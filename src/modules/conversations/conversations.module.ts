import { Module } from '@nestjs/common';
import { ConversationsService } from '@modules/conversations/conversations.service';
import { ConversationsController } from '@modules/conversations/conversations.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Conversation } from '@modules/conversations/entities/conversation.entity';
import { MessagesModule } from '@modules/messages/messages.module';
import { Message } from '@modules/messages/entities/message.entity';
import { ChatbotsModule } from '@modules/chatbots/chatbots.module';
import { EndUser } from '@modules/end-users/entities/end-user.entity';

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
