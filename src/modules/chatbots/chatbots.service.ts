import { KnowledgeDto } from './dto/knowledge.dto';
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
import { In, Repository } from 'typeorm';
import { UsersService } from '../users/users.service';
import { PublishChatbotDto } from './dto/publish-chatbot.dto';
import { ChatbotModelsService } from '../chatbot-models/chatbot-models.service';
import { WorkspacesService } from '../workspaces/workspaces.service';
import { ChatWithChatbotDto } from './dto/chat-with-chatbot.dto';
import { GetConfigDto } from './dto/get-config.dto';
import { ChatbotResource } from './entities/chatbot-resources.entity';
import { Resource } from '../resources/entities/resource.entity';
import { PromptInfoDto } from './dto/prompt.dto';
import { ChatbotOnboarding } from '../chatbot-onboarding/entities/chatbot-onboarding.entity';
import { OnboardingSuggestedQuestion } from '../onboarding-suggested-questions/entities/onboarding-suggested-question.entity';
import { CreateChatbotOnboardingDto } from '../chatbot-onboarding/dto/create-chatbot-onboarding.dto';

@Injectable()
export class ChatbotsService {
  constructor(
    @InjectRepository(Chatbot)
    private readonly chatbotRepository: Repository<Chatbot>,
    private readonly UserService: UsersService,
    private readonly chatbotModelsService: ChatbotModelsService,
    private readonly workspaceService: WorkspacesService,
    @InjectRepository(ChatbotResource)
    private chatbotResourceRepository: Repository<ChatbotResource>,
    @InjectRepository(Resource)
    private resourceRepository: Repository<Resource>,
    @InjectRepository(ChatbotOnboarding)
    private chatbotOnboardingRepository: Repository<ChatbotOnboarding>,
    @InjectRepository(OnboardingSuggestedQuestion)
    private suggestRepository: Repository<OnboardingSuggestedQuestion>,
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

  async findChatbotForUser(userId: string, chatbotId: string) {
    const chatbot = await this.chatbotRepository.findOne({
      where: {
        id: chatbotId,
        user: {
          id: userId,
        },
      },
      relations: {
        model: true,
        chatbot_resources: {
          resource: true,
        },
        onboarding: {
          suggested_questions: true,
        },
      },
      select: {
        model: {
          id: true,
          model_name: true,
        },
        onboarding: {
          id: true,
          prologue: true,
          suggested_questions: {
            id: true,
            position: true,
            question: true,
          },
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
      where: { id: chatbotId },
    });

    if (!chatbot) {
      throw new BadRequestException('Chatbot not found');
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

      if (!response.ok) {
        throw new BadRequestException(
          `Coze API request failed with status ${response.status}: ${response.statusText}`,
        );
      }

      if (!response.body) {
        throw new InternalServerErrorException(
          'No response body from Coze API',
        );
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');

      let botReply = '';
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const parts = buffer.split('\n\n');

        for (let i = 0; i < parts.length - 1; i++) {
          const part = parts[i];
          const lines = part.split('\n');
          let eventType = '';
          let dataRaw = '';

          for (const line of lines) {
            if (line.startsWith('event:')) {
              eventType = line.replace('event:', '').trim();
            } else if (line.startsWith('data:')) {
              dataRaw += line.replace('data:', '').trim();
            }
          }

          if (eventType && dataRaw) {
            try {
              const data = JSON.parse(dataRaw);
              console.log('Parsed event:', eventType, 'Data:', data);

              if (
                eventType === 'conversation.message.delta' &&
                data.role === 'assistant'
              ) {
                botReply += data.content;
                console.log('botReply', botReply);
              } else if (
                eventType === 'conversation.message.completed' &&
                data.role === 'assistant' &&
                data.type === 'answer'
              ) {
                botReply = data.content;
                console.log('botReply', botReply);
              } else if (eventType === 'done') {
                console.log('Stream completed.');
                break;
              }
            } catch (error) {
              console.error('Error parsing data:', error, 'Raw data:', dataRaw);
            }
          }
        }
        buffer = parts[parts.length - 1];
      }

      return botReply;
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
          space_id: workspace.external_space_id,
          name: chatbot.chatbot_name,
          description: updateChatbotDto.description || null,
        }),
      });

      const data = await response.json();
      if (!data?.data?.bot_id) return false;

      chatbot.external_bot_id = data.data.bot_id;
      chatbot.description = updateChatbotDto.description ?? chatbot.description;
      const updatedChatbot = await this.chatbotRepository.save(chatbot);

      return updatedChatbot;
    } catch (error) {
      console.error('Error:', error);
    }
  }

  async updateBasicInfoChatbot(
    chatbotId: string,
    updateChatbotDto: UpdateChatbotDto,
  ) {
    const chatbot = await this.chatbotRepository.findOne({
      where: { id: chatbotId },
      select: {
        id: true,
        external_bot_id: true,
        description: true,
        model: { id: true },
      },
      relations: {
        model: true,
      },
    });

    if (!chatbot) return false;

    try {
      const response = await fetch('https://api.coze.com/v1/bot/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${updateChatbotDto.api_token}`,
        },
        body: JSON.stringify({
          bot_id: chatbot.external_bot_id,
          name: updateChatbotDto.chatbot_name,
          description: updateChatbotDto.description || chatbot.description,
          model_info_config: updateChatbotDto.model_info_config,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      if (data.code !== 0) {
        throw new BadRequestException('Cannot update external bot');
      }

      await this.chatbotRepository.update(chatbot.id, {
        chatbot_name: updateChatbotDto.chatbot_name,
        description: updateChatbotDto.description || chatbot.description,
        model: {
          id: updateChatbotDto.model_info_config?.model_id || chatbot.model.id,
        },
      });

      return this.chatbotRepository.findOne({
        where: {
          id: chatbotId,
        },
        select: {
          model: {
            id: true,
            model_name: true,
          },
        },
        relations: {
          model: true,
        },
      });
    } catch (error) {
      console.error('Error updating bot:', error.message);
      throw new InternalServerErrorException('Failed to update chatbot.');
    }
  }

  async importKnowledge(chatbotId: string, knowledgeDto: KnowledgeDto) {
    const chatbot = await this.chatbotRepository.findOne({
      where: { id: chatbotId },
      select: {
        id: true,
        external_bot_id: true,
      },
    });

    if (!chatbot) return false;

    try {
      const response = await fetch('https://api.coze.com/v1/bot/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${knowledgeDto.api_token}`,
        },
        body: JSON.stringify({
          bot_id: chatbot.external_bot_id,
          knowledge: knowledgeDto,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      if (data.code !== 0) {
        throw new BadRequestException('Cannot update external bot');
      }

      const externalResourceIds = knowledgeDto.dataset_ids;

      if (
        Array.isArray(externalResourceIds) &&
        externalResourceIds.length > 0
      ) {
        const matchedResources = await this.resourceRepository.find({
          where: { external_resource_id: In(externalResourceIds) },
          select: ['id', 'external_resource_id'],
        });

        const resourceIdMap = new Map(
          matchedResources.map((r) => [r.external_resource_id, r.id]),
        );

        const existingRelations = await this.chatbotResourceRepository.find({
          where: { chatbot: { id: chatbot.id } },
          relations: ['resource'],
        });

        const existingResourceIds = new Set(
          existingRelations.map((r) => r.resource.id),
        );

        const toInsert = externalResourceIds
          .map((externalId) => resourceIdMap.get(externalId))
          .filter((id) => id && !existingResourceIds.has(id))
          .map((id) =>
            this.chatbotResourceRepository.create({
              chatbot: { id: chatbot.id },
              resource: { id },
            }),
          );

        if (toInsert.length > 0) {
          await this.chatbotResourceRepository.save(toInsert);
        }
      }
    } catch (error) {
      console.error('Error updating bot:', error.message);
      throw new InternalServerErrorException('Failed to update chatbot.');
    }
  }

  async importPrompt(chatbotId: string, promptInfoDto: PromptInfoDto) {
    const chatbot = await this.chatbotRepository.findOne({
      where: { id: chatbotId },
      select: {
        id: true,
        external_bot_id: true,
      },
    });

    if (!chatbot) return false;

    try {
      const response = await fetch('https://api.coze.com/v1/bot/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${promptInfoDto.api_token}`,
        },
        body: JSON.stringify({
          bot_id: chatbot.external_bot_id,
          prompt_info: {
            prompt: promptInfoDto.prompt_info,
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      if (data.code !== 0) {
        throw new BadRequestException('Cannot update external bot');
      }

      await this.chatbotRepository.update(chatbot.id, {
        prompt_info: promptInfoDto.prompt_info,
      });

      return this.chatbotRepository.findOne({
        where: {
          id: chatbotId,
        },
      });
    } catch (error) {
      console.error('Error updating bot:', error.message);
      throw new InternalServerErrorException('Failed to update chatbot.');
    }
  }

  async createOnboarding(
    chatbotId: string,
    createChatbotOnboardingDto: CreateChatbotOnboardingDto,
  ) {
    const chatbot = await this.chatbotRepository.findOne({
      where: { id: chatbotId },
      select: {
        id: true,
        external_bot_id: true,
      },
    });

    if (!chatbot) return false;

    const onboardingInfo: Record<string, any> = {
      prologue: createChatbotOnboardingDto.prologue,
    };

    if (
      Array.isArray(createChatbotOnboardingDto.suggested_questions) &&
      createChatbotOnboardingDto.suggested_questions.length > 0
    ) {
      onboardingInfo.suggested_questions =
        createChatbotOnboardingDto.suggested_questions.map((q) => q.question);
    }

    try {
      const response = await fetch('https://api.coze.com/v1/bot/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${createChatbotOnboardingDto.api_token}`,
        },
        body: JSON.stringify({
          bot_id: chatbot.external_bot_id,
          onboarding_info: createChatbotOnboardingDto,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      if (data.code !== 0) {
        throw new BadRequestException('Cannot update external bot');
      }

      const newOnboarding = this.chatbotOnboardingRepository.create(
        createChatbotOnboardingDto,
      );
      await this.chatbotOnboardingRepository.save(newOnboarding);

      if (
        Array.isArray(createChatbotOnboardingDto.suggested_questions) &&
        createChatbotOnboardingDto.suggested_questions.length > 0
      ) {
        const questionsToSave =
          createChatbotOnboardingDto.suggested_questions.map((q) =>
            this.suggestRepository.create({
              chatbot_onboarding: newOnboarding,
              question: q.question,
              position: q.position,
            }),
          );

        await this.suggestRepository.save(questionsToSave);
      }

      return newOnboarding;
    } catch (error) {
      console.error('Error updating bot:', error.message);
      throw new InternalServerErrorException('Failed to update chatbot.');
    }
  }

  async getChatbotConfig(chatbotId: string, getConfigDto: GetConfigDto) {
    const chatbot = await this.chatbotRepository.findOne({
      where: {
        id: chatbotId,
      },
    });
    if (!chatbot?.external_bot_id) {
      throw new BadRequestException('Chatbot no publish');
    }
    try {
      const response = await fetch(
        `https://api.coze.com/v1/bot/get_online_info?bot_id=${chatbot.external_bot_id}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${getConfigDto.api_token}`,
          },
        },
      );

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error updating bot:', error.message);
    }
  }

  remove(id: string) {
    return `This action removes a #${id} chatbot`;
  }
}
