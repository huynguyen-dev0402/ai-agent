import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateChatbotDto } from './dto/create-chatbot.dto';
import { UpdateChatbotDto } from './dto/update-chatbot.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Chatbot, ChatbotStatus } from './entities/chatbot.entity';
import { Repository } from 'typeorm';
import { UsersService } from '../users/users.service';
import { PublishChatbotDto } from './dto/publish-chatbot.dto';
import { ChatbotModelsService } from '../chatbot-models/chatbot-models.service';
import { WorkspacesService } from '../workspaces/workspaces.service';
import { ChatWithChatbotDto } from './dto/chat-with-chatbot.dto';

@Injectable()
export class ChatbotsService {
  constructor(
    @InjectRepository(Chatbot)
    private readonly chatbotRepository: Repository<Chatbot>,
    private readonly UserService: UsersService,
    private readonly chatbotModelsService: ChatbotModelsService,
    private readonly workspaceService: WorkspacesService,
  ) {}

  async findAllChatbotsForUser(userId: string) {
    const chatbots = await this.chatbotRepository.find({
      where: {
        user: {
          id: userId,
        },
      },
    });
    return chatbots;
  }

  async findChatbotForUser(userId: string, chatbotId:string) {
    const chatbot = await this.chatbotRepository.findOne({
      where: {
        id:chatbotId,
        user: {
          id: userId,
        },
      },
    });
    return chatbot;
  }

  async chatWithBot(
    externalUserId: string,
    chatbotId: string,
    chatWithChatbotDto: ChatWithChatbotDto,
  ) {
    const chatbot = await this.chatbotRepository.findOne({
      where: {
        id: chatbotId,
      },
    });
    if (!chatbot) {
      return false;
    }
    try {
      const response = await fetch('https://api.coze.com/v3/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${chatWithChatbotDto.api_token}`,
        },
        body: JSON.stringify({
          bot_id: chatbot.external_bot_id,
          user_id: externalUserId,
          stream: true,
          auto_save_history: true,
          additional_messages: [
            {
              role: 'user',
              content: chatWithChatbotDto.message,
              content_type: 'text',
            },
          ],
        }),
      });

      // Check HTTP encryption status
      if (!response.ok) {
        throw new BadRequestException(
          `Coze API request failed with status ${response.status}: ${response.statusText}`,
        );
      }

      // Check if response.body exists
      if (!response.body) {
        throw new InternalServerErrorException(
          'No response body received from Coze API',
        );
      }

      // Stream data processing
      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let result = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        // Decode data from stream
        const chunk = decoder.decode(value, { stream: true });
        result += chunk;
      }

      // (Optional) Parse the data if the API returns JSON or a specific format
      // Assuming result is a JSON string, you can parse it
      try {
        const parsedResult = JSON.parse(result);
        return parsedResult;
      } catch (error) {
        return result;
      }
    } catch (error) {
      if (
        error instanceof BadRequestException ||
        error instanceof InternalServerErrorException
      ) {
        throw error;
      }
      throw new InternalServerErrorException(
        `Failed to communicate with Coze API: ${error.message}`,
      );
    }
  }

  findAll() {
    return `This action returns all chatbots`;
  }

  async create(createChatbotDto: CreateChatbotDto) {
    // const workspace = await this.workspaceService.findOne(
    //   createChatbotDto.workspace_id,
    // );
    // if (!workspace) {
    //   return false;
    // }
    // const newChatbot = this.chatbotRepository.create({
    //   ...createChatbotDto,
    //   workspace,
    // });
    // await this.chatbotRepository.save(newChatbot);
    // return workspace;
  }

  async createChatbotByUser(
    userId: string,
    createChatbotDto: CreateChatbotDto,
  ) {
    const model = await this.chatbotModelsService.findOne('1716293913');

    if (!model) {
      throw new NotFoundException('Model not found');
    }
    const user = await this.UserService.findOne(userId);
    const chatbot = {
      ...createChatbotDto,
      user_id: userId,
      model_id: '1716293913',
      model,
      user,
    };
    const newChatbot = this.chatbotRepository.create(chatbot);
    await this.chatbotRepository.save(newChatbot);

    return newChatbot;
  }

  async publishChatbotByUser(
    chatbotId: string,
    publishChatbotDto: PublishChatbotDto,
  ) {
    const chatbot = await this.chatbotRepository.findOne({
      where: {
        id: chatbotId,
      },
    });
    if (!chatbot?.external_bot_id) {
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
          bot_id: chatbot.external_bot_id,
          connector_ids: [publishChatbotDto.connector_id],
        }),
      });

      const data = await response.json();
      if (!data?.data?.bot_id) return false;

      await this.chatbotRepository.update(chatbot.id, {
        status: ChatbotStatus.PUBLISHED,
      });
      return data;
    } catch (error) {
      console.error('Error:', error);
    }
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

  async updateChatbotByUser(
    userId: string,
    chatbotId: string,
    updateChatbotDto: UpdateChatbotDto,
  ) {
    const workspace = await this.workspaceService.findWorkspaceByUserId(userId);
    if (!workspace) {
      throw new NotFoundException('Workspace not found');
    }
    const chatbot = await this.chatbotRepository.findOne({
      where: {
        id: chatbotId,
      },
      relations: {
        model: true,
      },
      select: {
        model: {
          id: true,
          model_name: true,
        },
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
          space_id: workspace.external_space_id,
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
