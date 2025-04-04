import { Injectable } from '@nestjs/common';
import { CreateChatbotDto } from './dto/create-chatbot.dto';
import { UpdateChatbotDto } from './dto/update-chatbot.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Chatbot } from './entities/chatbot.entity';
import { Repository } from 'typeorm';
import { UsersService } from '../users/users.service';

@Injectable()
export class ChatbotsService {
  constructor(
    @InjectRepository(Chatbot)
    private readonly chatbotRepository: Repository<Chatbot>,
    private readonly UserService: UsersService,
  ) {}
  async create(createChatbotDto: CreateChatbotDto) {
    try {
      const response = await fetch('https://api.coze.com/v1/bot/create', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${createChatbotDto.api_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          onboarding_info: {
            prologue: 'Xin chào, tôi có thể giúp gì cho bạn?',
            suggested_questions: ['Câu hỏi 1'],
          },
          model_info_config: {
            model_id: createChatbotDto.model_id,
          },
          prompt_info: {
            prompt: createChatbotDto.prompt_info,
          },
          space_id: createChatbotDto.workspace_id,
          name: createChatbotDto.chatbot_name,
        }),
      });

      const data = await response.json();
      if (!data) {
        return false;
      }

      const user = await this.UserService.findOne(createChatbotDto.user_id);
      if (!user) {
        return false;
      }

      const newData = {
        id: data.data.bot_id,
        user_id: createChatbotDto.user_id,
        space_id: createChatbotDto.workspace_id,
        chatbot_name: createChatbotDto.chatbot_name,
        prompt_info: createChatbotDto.prompt_info ?? undefined,
        description: createChatbotDto.description ?? undefined,
        user,
      };
      const newChatbot = this.chatbotRepository.create(newData);
      await this.chatbotRepository.save(newChatbot);

      return newChatbot.id;
    } catch (error) {
      console.error('Error:', error);
    }
  }

  findAll() {
    return `This action returns all chatbots`;
  }

  findOne(id: number) {
    return `This action returns a #${id} chatbot`;
  }

  update(id: number, updateChatbotDto: UpdateChatbotDto) {
    return `This action updates a #${id} chatbot`;
  }

  remove(id: number) {
    return `This action removes a #${id} chatbot`;
  }
}
