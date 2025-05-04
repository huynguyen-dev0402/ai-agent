import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Message, SenderType } from '@modules/messages/entities/message.entity';
import { CreateMessageDto } from '@modules/messages/dto/create-message.dto';
import { ChatWithChatbotDto } from '@modules/chatbots/dto/chat-with-chatbot.dto';

@Injectable()
export class MessagesService {
  constructor(
    @InjectRepository(Message)
    private readonly messageRepository: Repository<Message>,
  ) {}

  // async chatWithBotStream(
  //     externalUserId: string,
  //     chatbotId: string,
  //     chatWithChatbotDto: ChatWithChatbotDto,
  //     res: Response,
  //   ) {
  //     const chatbot = await this.chatbotRepository.findOne({
  //       where: { id: chatbotId },
  //     });
  
  //     if (!chatbot) {
  //       throw new NotFoundException('Chatbot not found');
  //     }
  
  //     const conversation = await this.conversationRepository.findOne({
  //       where: {
  //         id: chatWithChatbotDto.conversation_id,
  //       },
  //     });
  
  //     if (!conversation) {
  //       throw new NotFoundException('Conversation not found');
  //     }
  
  //     await this.messageService.saveMessageUser({
  //       conversation_id: conversation.id,
  //       sender_type: SenderType.USER,
  //       message_content: chatWithChatbotDto.message,
  //       send_at: new Date(),
  //     });
  
  //     try {
  //       const response = await fetch(
  //         `https://api.coze.com/v3/chat?conversation_id=${conversation.external_conversation_id}`,
  //         {
  //           method: 'POST',
  //           headers: {
  //             'Content-Type': 'application/json',
  //             Authorization: `Bearer ${chatWithChatbotDto.api_token}`,
  //           },
  //           body: JSON.stringify({
  //             bot_id: chatbot.external_bot_id,
  //             user_id: externalUserId,
  //             stream: true,
  //             auto_save_history: true,
  //             additional_messages: [
  //               {
  //                 role: 'user',
  //                 content: chatWithChatbotDto.message,
  //                 content_type: 'text',
  //               },
  //             ],
  //           }),
  //         },
  //       );
  
  //       if (!response.ok || !response.body) {
  //         throw new InternalServerErrorException(
  //           `Coze API request failed with status ${response.status}`,
  //         );
  //       }
  
  //       // Set headers to keep stream format
  //       res.setHeader('Content-Type', 'text/event-stream');
  //       res.setHeader('Cache-Control', 'no-cache');
  //       res.setHeader('Connection', 'keep-alive');
  
  //       const reader = response.body.getReader();
  //       const decoder = new TextDecoder();
  
  //       const pump = async () => {
  //         let fullMessage = ''; // Dùng để tích luỹ nội dung cuối cùng
  //         while (true) {
  //           const { done, value } = await reader.read();
  //           if (done) break;
  //           if (value) {
  //             const chunk = decoder.decode(value);
  //             res.write(chunk);
  //             // Lấy data từ chunk nếu là event message.delta hoặc message.completed
  //             const matches = chunk.match(/data:(.*)/g);
  //             if (matches) {
  //               matches.forEach((line) => {
  //                 try {
  //                   const dataStr = line.replace(/^data:\s*/, '');
  //                   const parsed = JSON.parse(dataStr);
  //                   if (
  //                     parsed?.event === 'conversation.message.delta' ||
  //                     parsed?.event === 'conversation.message.completed'
  //                   ) {
  //                     // Tích lũy content
  //                     if (
  //                       parsed.content_type === 'text' &&
  //                       typeof parsed.content === 'string'
  //                     ) {
  //                       fullMessage += parsed.content;
  //                     }
  //                   }
  //                 } catch (err) {
  //                   // Bỏ qua lỗi parse JSON không hợp lệ
  //                 }
  //               });
  //             }
  //           }
  //         }
  //         res.end();
  
  //         await this.messageService.saveMessageUser({
  //           conversation_id: conversation.id,
  //           sender_type: SenderType.CHATBOT,
  //           message_content: fullMessage,
  //           send_at: new Date(),
  //         });
  //       };
  
  //       pump().catch((err) => {
  //         console.error('Streaming error:', err);
  //         res.end();
  //       });
  //     } catch (error) {
  //       console.error('Chatbot stream error:', error);
  //       res.status(500).json({ message: 'Failed to communicate with Coze API' });
  //     }
  //   }

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
