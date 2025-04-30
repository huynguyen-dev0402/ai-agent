import { forwardRef, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CreateConversationDto } from './dto/create-conversation.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Conversation } from './entities/conversation.entity';
import { Repository } from 'typeorm';
import { ChatbotsService } from '../chatbots/chatbots.service';

@Injectable()
export class ConversationsService {
  constructor(
    @InjectRepository(Conversation)
    private readonly conversationRepository: Repository<Conversation>,
    private readonly chatbotService: ChatbotsService,
  ) {}
  async findOne(id: string) {
    return this.conversationRepository.findOne({
      where: {
        id,
      },
    });
  }
  async createConversation(createDto: CreateConversationDto): Promise<any> {
    const chatbot = await this.chatbotService.findOne(createDto.chatbot_id);
    if (!chatbot) {
      throw new NotFoundException('Chatbot not found');
    }
    try {
      const response = await fetch(
        'https://api.coze.com/v1/conversation/create',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${createDto.api_token}`,
          },
          body: JSON.stringify({
            bot_id: chatbot.external_bot_id,
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
        chatbot: { id: chatbot.id },
        external_conversation_id: data.data.id,
      });
      return this.conversationRepository.save(newConversation);
    } catch (error) {
      console.error('Error creating conversation:', error);
      throw error;
    }
  }
}
