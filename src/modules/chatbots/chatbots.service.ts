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
import { DataSource, In, Repository } from 'typeorm';
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
import { UpdateChatbotOnboardingDto } from '../chatbot-onboarding/dto/update-chatbot-onboarding.dto';
import { Response } from 'express';

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
    private dataSource: DataSource,
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

  async chatWithBotStream(
    externalUserId: string,
    chatbotId: string,
    chatWithChatbotDto: ChatWithChatbotDto,
    res: Response,
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

      if (!response.ok || !response.body) {
        throw new InternalServerErrorException(
          `Coze API request failed with status ${response.status}`,
        );
      }

      // Set headers to keep stream format
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');

      const reader = response.body.getReader();
      const decoder = new TextDecoder(); 

      const pump = async () => {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          if (value) {
            const chunk = decoder.decode(value, { stream: true });
            res.write(chunk); // Sen stream to client
          }
        }
        res.end();
      };

      pump().catch((err) => {
        console.error('Streaming error:', err);
        res.end();
      });
    } catch (error) {
      console.error('Chatbot stream error:', error);
      res.status(500).json({ message: 'Failed to communicate with Coze API' });
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
        user: {
          id: userId,
        },
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
      if (data.code != 0) {
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
      if (data.code != 0) {
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
      return true;
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
      if (data.code != 0) {
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
          onboarding_info: onboardingInfo,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      if (data.code != 0) {
        throw new BadRequestException('Cannot update external bot');
      }

      const newOnboarding = this.chatbotOnboardingRepository.create({
        ...createChatbotOnboardingDto,
        chatbot,
      });
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

  async updateChatbotOnboarding(
    chatbotId: string,
    onboardingId: string,
    updateChatbotOnboardingDto: UpdateChatbotOnboardingDto,
  ) {
    const {
      prologue,
      suggested_questions = [],
      api_token,
    } = updateChatbotOnboardingDto;

    const chatbot = await this.chatbotRepository.findOne({
      where: {
        id: chatbotId,
        onboarding: {
          id: onboardingId,
        },
      },
      select: {
        id: true,
        external_bot_id: true,
      },
    });

    if (!chatbot) return false;
    if (!chatbot.external_bot_id) {
      throw new BadRequestException('External bot ID is missing');
    }

    const onboardingInfo: Record<string, any> = {};
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Update prologue in database
      if (prologue !== undefined) {
        await queryRunner.manager.update(
          this.chatbotOnboardingRepository.target,
          onboardingId,
          {
            prologue,
          },
        );
        onboardingInfo.prologue = prologue;
      }

      // Always delete old suggested questions
      await queryRunner.manager.delete(OnboardingSuggestedQuestion, {
        chatbot_onboarding: { id: onboardingId },
      });

      // If client sent suggested_questions, insert them
      if (
        Array.isArray(suggested_questions) &&
        suggested_questions.length > 0
      ) {
        await queryRunner.manager.insert(
          OnboardingSuggestedQuestion,
          suggested_questions.map((q) => ({
            position: q.position,
            question: q.question,
            chatbot_onboarding: { id: onboardingId },
          })),
        );

        onboardingInfo.suggested_questions = suggested_questions.map(
          (q) => q.question,
        );
      }

      await queryRunner.commitTransaction();
    } catch (err) {
      await queryRunner.rollbackTransaction();
      console.error('DB transaction error:', err);
      throw new InternalServerErrorException(
        'Failed to update onboarding data',
      );
    } finally {
      await queryRunner.release();
    }

    // Call Coze API
    try {
      const response = await fetch('https://api.coze.com/v1/bot/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${api_token}`,
        },
        body: JSON.stringify({
          bot_id: chatbot.external_bot_id,
          onboarding_info: onboardingInfo,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      if (data.code != 0) {
        throw new BadRequestException('Cannot update external bot');
      }

      return this.chatbotOnboardingRepository
        .createQueryBuilder('onboarding')
        .leftJoinAndSelect('onboarding.suggested_questions', 'sq')
        .select([
          'onboarding.id',
          'onboarding.prologue',
          'sq.id',
          'sq.position',
          'sq.question',
        ])
        .where('onboarding.id = :id', { id: onboardingId })
        .getOne();
    } catch (error) {
      console.error('Error updating bot:', error.message);
      throw new InternalServerErrorException('Failed to update chatbot');
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
