import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateConversationDto } from '@modules/conversations/dto/create-conversation.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Conversation } from '@modules/conversations/entities/conversation.entity';
import { Repository } from 'typeorm';
import { ChatbotsService } from '@modules/chatbots/chatbots.service';
import { User, UserStatus } from '@modules/users/entities/user.entity';

@Injectable()
export class ConversationsService {
  constructor(
    @InjectRepository(Conversation)
    private readonly conversationRepository: Repository<Conversation>,
    private readonly chatbotService: ChatbotsService,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}
  async findOne(id: string) {
    return this.conversationRepository.findOne({
      where: {
        id,
      },
    });
  }

  async findAllByChatbotId(chatbotId: string) {
    return this.conversationRepository.find({
      where: {
        chatbot: {
          id: chatbotId,
        },
      },
    });
  }

  async findAllByUserId(userId: string) {
    return this.conversationRepository.find({
      where: {
        chatbot: {
          user: {
            id: userId,
          },
        },
      },
    });
  }

  async createConversation(createDto: CreateConversationDto): Promise<any> {
    const user = await this.userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.api_token', 'api_token')
      .leftJoinAndSelect('user.chatbots', 'chatbot')
      .where('user.id = :userId', { userId: createDto.user_id })
      .andWhere('user.status = :status', { status: UserStatus.ACTIVE })
      .andWhere('chatbot.id = :chatbotId', { chatbotId: createDto.chatbot_id })
      .select([
        'user.id',
        'api_token.id',
        'api_token.token',
        'chatbot.id',
        'chatbot.external_bot_id',
      ])
      .getOne();
    if (!user) {
      throw new NotFoundException('User or Chatbot not found');
    }
    try {
      const response = await fetch(
        'https://api.coze.com/v1/conversation/create',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${user.api_token.token}`,
          },
          body: JSON.stringify({
            bot_id: user.chatbots[0].external_bot_id,
          }),
        },
      );

      if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(`Coze API error: ${response.status} ${errorBody}`);
      }

      const data = await response.json();
      if (data.code != 0) {
        const errorBody = await response.text();
        throw new Error(`Coze API error: ${response.status} ${errorBody}`);
      }
      const newConversation = this.conversationRepository.create({
        chatbot: { id: user.chatbots[0].id },
        external_conversation_id: data.data.id,
      });
      return this.conversationRepository.save(newConversation);
    } catch (error) {
      console.error('Error creating conversation:', error);
      throw error;
    }
  }
}
