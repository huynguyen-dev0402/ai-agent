import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Message } from './entities/message.entity';
import { CreateMessageDto } from './dto/create-message.dto';

@Injectable()
export class MessagesService {
  constructor(
    @InjectRepository(Message)
    private readonly messageRepository: Repository<Message>,
  ) {}

  async saveMessageUser(createMessageDto: CreateMessageDto) {
    const message = this.messageRepository.create({
      conversation: { id: createMessageDto.conversation_id },
      ...createMessageDto,
    });
    await this.messageRepository.save(message);
  }

  async findMessagesByCustomerId(
    userId: string,
    options: {
      chatbotId?: string;
      status?: 'active' | 'ended';
      startDate?: Date;
      endDate?: Date;
      limit?: number;
      offset?: number;
    },
  ) {
    const {
      chatbotId,
      status,
      startDate,
      endDate,
      limit = 50,
      offset = 0,
    } = options;

    const query = this.messageRepository
      .createQueryBuilder('messages')
      .innerJoinAndSelect('messages.conversation', 'conversations')
      .innerJoinAndSelect('conversations.chatbot', 'chatbots')
      .innerJoinAndSelect('conversations.end_user', 'end_users')
      .where('chatbots.user.id = :userId', { userId });

    if (chatbotId) {
      query.andWhere('conversations.chatbot.id = :chatbotId', { chatbotId }); 
    }
    if (status) {
      query.andWhere('conversations.status = :status', { status }); 
    }
    if (startDate) {
      query.andWhere('messages.sent_at >= :startDate', { startDate }); 
    }
    if (endDate) {
      query.andWhere('messages.sent_at <= :endDate', { endDate }); 
    }

    return query
      .orderBy('messages.sent_at', 'ASC')
      .take(limit)
      .skip(offset)
      .getMany();
  }

  async getMessagesByAgent(
    chatbotId: string,
    options: {
      status?: 'active' | 'ended';
      startDate?: Date;
      endDate?: Date;
      limit?: number;
      offset?: number;
    },
  ) {
    const { status, startDate, endDate, limit = 50, offset = 0 } = options;

    const query = this.messageRepository
      .createQueryBuilder('message')
      .innerJoinAndSelect('message.conversation', 'conversation')
      .innerJoinAndSelect('conversation.chatbot', 'chatbot')
      .innerJoinAndSelect('conversation.end_user', 'end_user')
      .where('chatbot.id = :chatbotId', { chatbotId });

    if (status) {
      query.andWhere('conversation.status = :status', { status });
    }
    if (startDate) {
      query.andWhere('message.sent_at >= :startDate', { startDate });
    }
    if (endDate) {
      query.andWhere('message.sent_at <= :endDate', { endDate });
    }

    const messages = await query
      .orderBy('message.sent_at', 'ASC')
      .take(limit)
      .skip(offset)
      .getMany();

    const conversations: { [key: string]: any } = {};
    for (const message of messages) {
      const convId = message.conversation.id;
      if (!conversations[convId]) {
        conversations[convId] = {
          conversation_id: convId,
          external_conversation_id:
            message.conversation.external_conversation_id,
          chatbot_name: message.conversation.chatbot.chatbot_name,
          end_user: {
            name: message.conversation.end_user.name || 'Unknown',
            external_id: message.conversation.end_user.external_id,
            platform: message.conversation.end_user.platform,
          },
          started_at: message.conversation.started_at,
          status: message.conversation.status,
          messages: [],
        };
      }
      conversations[convId].messages.push({
        id: message.id,
        content: message.message_content,
        sender: message.sender_type,
        sent_at: message.sent_at,
      });
    }

    return Object.values(conversations);
  }

  async getCustomerMessageHistory(
    userId: string,
    options: {
      chatbotId?: string;
      status?: 'active' | 'ended';
      startDate?: Date;
      endDate?: Date;
      limit?: number;
      offset?: number;
    },
  ) {
    const messages = await this.findMessagesByCustomerId(userId, options);

    const conversations: { [key: string]: any } = {};
    for (const message of messages) {
      const convId = message.conversation.id;
      if (!conversations[convId]) {
        conversations[convId] = {
          conversation_id: convId,
          external_conversation_id:
            message.conversation.external_conversation_id,
          chatbot_name: message.conversation.chatbot.chatbot_name,
          end_user: {
            name: message.conversation.end_user.name || 'Unknown',
            external_id: message.conversation.end_user.external_id,
            platform: message.conversation.end_user.platform,
          },
          started_at: message.conversation.started_at,
          status: message.conversation.status,
          messages: [],
        };
      }
      conversations[convId].messages.push({
        id: message.id,
        content: message.message_content,
        sender: message.sender_type,
        sent_at: message.sent_at,
      });
    }

    return Object.values(conversations);
  }

  //Lấy danh sách tin nhắn theo end-user
  async getMessageHistory(
    endUserId: string,
    options: {
      status?: 'active' | 'ended';
      startDate?: Date;
      endDate?: Date;
      limit?: number;
      offset?: number;
    },
  ) {
    const { status, startDate, endDate, limit = 50, offset = 0 } = options;

    const query = this.messageRepository
      .createQueryBuilder('message')
      .innerJoinAndSelect('message.conversation', 'conversation')
      .innerJoinAndSelect('conversation.chatbot', 'chatbot')
      .innerJoinAndSelect('conversation.end_user', 'end_user')
      .where('conversation.end_user.id = :endUserId', { endUserId });

    if (status) {
      query.andWhere('conversation.status = :status', { status });
    }
    if (startDate) {
      query.andWhere('message.sent_at >= :startDate', { startDate });
    }
    if (endDate) {
      query.andWhere('message.sent_at <= :endDate', { endDate });
    }

    const messages = await query
      .orderBy('message.sent_at', 'ASC')
      .take(limit)
      .skip(offset)
      .getMany();

    const conversations: { [key: string]: any } = {};
    for (const message of messages) {
      const convId = message.conversation.id;
      if (!conversations[convId]) {
        conversations[convId] = {
          conversation_id: convId,
          external_conversation_id:
            message.conversation.external_conversation_id,
          chatbot_name: message.conversation.chatbot.chatbot_name,
          end_user: {
            name: message.conversation.end_user.name || 'Unknown',
            external_id: message.conversation.end_user.external_id,
            platform: message.conversation.end_user.platform,
          },
          started_at: message.conversation.started_at,
          status: message.conversation.status,
          messages: [],
        };
      }
      conversations[convId].messages.push({
        id: message.id,
        content: message.message_content,
        sender: message.sender_type,
        sent_at: message.sent_at,
      });
    }

    return Object.values(conversations);
  }
}
