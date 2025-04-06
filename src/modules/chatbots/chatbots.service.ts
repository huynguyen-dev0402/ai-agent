import { BadGatewayException, Injectable } from '@nestjs/common';
import { CreateChatbotDto } from './dto/create-chatbot.dto';
import { UpdateChatbotDto } from './dto/update-chatbot.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Chatbot } from './entities/chatbot.entity';
import { Repository } from 'typeorm';
import { UsersService } from '../users/users.service';
import { PublishChatbotDto } from './dto/publish-chatbot.dto';
import { WorkspacesService } from '../workspaces/workspaces.service';

@Injectable()
export class ChatbotsService {
  constructor(
    @InjectRepository(Chatbot)
    private readonly chatbotRepository: Repository<Chatbot>,
    private readonly UserService: UsersService,
    private readonly workspaceService: WorkspacesService,
  ) {}
  async create(createChatbotDto: CreateChatbotDto) {
    const workspace = await this.workspaceService.findOne(
      createChatbotDto.workspace_id,
    );
    if (!workspace) {
      return false;
    }
    const newChatbot = this.chatbotRepository.create({
      ...createChatbotDto,
      workspace,
    });
    await this.chatbotRepository.save(newChatbot);

    return newChatbot;
  }

  async publish(externalBotId: string, publishChatbotDto: PublishChatbotDto) {
    const bot = await this.chatbotRepository.findOne({
      where: {
        external_bot_id: externalBotId,
      },
    });
    if (!bot) {
      return false;
    }
    try {
      const response = await fetch('https://api.coze.com/v1/bot/publish', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${publishChatbotDto.api_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          bot_id: externalBotId,
          connector_ids: [publishChatbotDto.connector_id],
        }),
      });

      const data = await response.json();
      if (!data?.data?.bot_id) return false;

      return data;
    } catch (error) {
      console.error('Error:', error);
    }
  }

  findAll() {
    return `This action returns all chatbots`;
  }

  async findOne(id: string) {
    const chatbot = await this.chatbotRepository.find({
      where: {
        id,
      },
    });
    if (!chatbot) {
      return false;
    }
    return chatbot;
  }

  async update(id: string, updateChatbotDto: UpdateChatbotDto) {
    const chatbot = await this.chatbotRepository.findOne({
      where: {
        id,
      },
    });

    if (!chatbot) {
      return false;
    }

    try {
      const response = await fetch('https://api.coze.com/v1/bot/create', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${updateChatbotDto.api_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          onboarding_info: {
            prologue: 'Xin chào, tôi có thể giúp gì cho bạn?',
            suggested_questions: ['Câu hỏi 1'],
          },
          model_info_config: {
            model_id: chatbot.model.id,
          },
          prompt_info: {
            prompt: updateChatbotDto.prompt_info,
          },
          space_id: chatbot.workspace.id,
          name: chatbot.chatbot_name,
        }),
      });

      const data = await response.json();
      if (!data?.data?.bot_id) return false;

      chatbot.external_bot_id = data.data.bot_id;
      chatbot.prompt_info = updateChatbotDto.prompt_info ?? chatbot.prompt_info;
      chatbot.description = updateChatbotDto.description ?? chatbot.description;
      const updatedChatbot = await this.chatbotRepository.save(chatbot);

      return updatedChatbot;
    } catch (error) {
      console.error('Error:', error);
    }
  }

  remove(id: string) {
    return `This action removes a #${id} chatbot`;
  }
}
