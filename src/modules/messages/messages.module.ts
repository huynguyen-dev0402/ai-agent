import { Module } from '@nestjs/common';
import { MessagesService } from '@modules/messages/messages.service';
import { MessagesController } from '@modules/messages/messages.controller';
import { Message } from '@modules/messages/entities/message.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Chatbot } from '@modules/chatbots/entities/chatbot.entity';
import { Conversation } from '@modules/conversations/entities/conversation.entity';
import { User } from '@modules/users/entities/user.entity';
import { EndUser } from '@modules/end-users/entities/end-user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Message, Conversation, Chatbot, User, EndUser]),
  ],
  controllers: [MessagesController],
  providers: [MessagesService],
  exports: [MessagesService],
})
export class MessagesModule {}
