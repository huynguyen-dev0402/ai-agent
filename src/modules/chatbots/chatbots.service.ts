import { KnowledgeDto } from '@modules/chatbots/dto/knowledge.dto';
import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateChatbotDto } from '@modules/chatbots/dto/create-chatbot.dto';
import { UpdateChatbotDto } from '@modules/chatbots/dto/update-chatbot.dto';
import { InjectRepository } from '@nestjs/typeorm';
import {
  Chatbot,
  ChatbotStatus,
} from '@modules/chatbots/entities/chatbot.entity';
import { DataSource, In, Repository } from 'typeorm';
import { UsersService } from '@modules/users/users.service';
import { PublishChatbotDto } from '@modules/chatbots/dto/publish-chatbot.dto';
import { ChatbotModelsService } from '@modules/chatbot-models/chatbot-models.service';
import { WorkspacesService } from '@modules/workspaces/workspaces.service';
import { ChatWithChatbotDto } from '@modules/chatbots/dto/chat-with-chatbot.dto';
import { GetConfigDto } from '@modules/chatbots/dto/get-config.dto';
import { ChatbotResource } from '@modules/chatbots/entities/chatbot-resources.entity';
import { Resource } from '@modules/resources/entities/resource.entity';
import { PromptInfoDto } from '@modules/chatbots/dto/prompt.dto';
import { ChatbotOnboarding } from '@modules/chatbot-onboarding/entities/chatbot-onboarding.entity';
import { OnboardingSuggestedQuestion } from '@modules/onboarding-suggested-questions/entities/onboarding-suggested-question.entity';
import { CreateChatbotOnboardingDto } from '@modules/chatbot-onboarding/dto/create-chatbot-onboarding.dto';
import { UpdateChatbotOnboardingDto } from '@modules/chatbot-onboarding/dto/update-chatbot-onboarding.dto';
import { Response } from 'express';
import { User, UserStatus } from '@modules/users/entities/user.entity';
import { MessagesService } from '@modules/messages/messages.service';
import { SenderType } from '@modules/messages/entities/message.entity';
import { Conversation } from '@modules/conversations/entities/conversation.entity';
import { ChatWithChatbotEmbedDto } from '@modules/chatbot-embed/dto/chat-chatbot-embed.dto';
import { ChatbotTokensService } from '@modules/chatbot-tokens/chatbot-tokens.service';
import { Domain, DomainStatus } from '@modules/domains/entities/domain.entity';
import {
  ChatbotToken,
  ChatbotTokenStatus,
} from '@modules/chatbot-tokens/entities/chatbot-token.entity';

@Injectable()
export class ChatbotsService {
  constructor(
    @InjectRepository(Chatbot)
    private readonly chatbotRepository: Repository<Chatbot>,
    private readonly userService: UsersService,
    private readonly chatbotModelsService: ChatbotModelsService,
    private readonly workspaceService: WorkspacesService,
    private readonly messageService: MessagesService,
    private readonly chatbotTokenService: ChatbotTokensService,
    @InjectRepository(ChatbotResource)
    private chatbotResourceRepository: Repository<ChatbotResource>,
    @InjectRepository(Resource)
    private resourceRepository: Repository<Resource>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(ChatbotOnboarding)
    private chatbotOnboardingRepository: Repository<ChatbotOnboarding>,
    @InjectRepository(OnboardingSuggestedQuestion)
    private suggestRepository: Repository<OnboardingSuggestedQuestion>,
    @InjectRepository(Conversation)
    private conversationRepository: Repository<Conversation>,
    @InjectRepository(Domain)
    private readonly domainRepository: Repository<Domain>,
    @InjectRepository(ChatbotToken)
    private readonly chatbotTokenRepository: Repository<ChatbotToken>,
    private dataSource: DataSource,
  ) {}

  private normalizeHost(host: string): string {
    let normalized = host.replace(/^https?:\/\//, '').replace(/\/.*$/, '');
    normalized = normalized
      .replace(/^www\./, '')
      .trim()
      .toLowerCase();
    return normalized;
  }

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
    chatbotId: string,
    chatWithChatbotDto: ChatWithChatbotDto,
    res: Response,
  ) {
    const chatbot = await this.chatbotRepository
      .createQueryBuilder('chatbot')
      .leftJoinAndSelect('chatbot.user', 'user')
      .leftJoinAndSelect('user.api_token', 'api_token')
      .select([
        'chatbot.id',
        'chatbot.external_bot_id',
        'user.id',
        'user.external_user_id',
        'api_token.id',
        'api_token.token',
      ])
      .where('chatbot.id = :chatbotId', { chatbotId })
      .getOne();

    if (!chatbot) {
      throw new NotFoundException('Chatbot not found');
    }

    const conversation = await this.conversationRepository.findOneBy({
      id: chatWithChatbotDto.conversation_id,
    });

    if (!conversation) {
      throw new NotFoundException('Conversation not found');
    }

    await this.messageService.saveMessageUser({
      conversation_id: conversation.id,
      sender_type: SenderType.USER,
      message_content: chatWithChatbotDto.message,
      send_at: new Date(),
    });

    try {
      const response = await fetch(
        `https://api.coze.com/v3/chat?conversation_id=${conversation.external_conversation_id}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${chatbot.user.api_token.token}`,
          },
          body: JSON.stringify({
            bot_id: chatbot.external_bot_id,
            user_id: chatbot.user.external_user_id,
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
        },
      );

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
      const logger = new Logger('SSEPump');
      let currentEvent = '';
      let currentData = '';
      let data: any;

      const pump = async () => {
        let fullMessage = ''; // Dùng để tích luỹ nội dung cuối cùng
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          if (value) {
            const chunk = decoder.decode(value);
            data += decoder.decode(value);
            res.write(chunk);
          }
        }

        // Split chunk into lines to process SSE format
        const lines = data.split('\n');
        for (const line of lines) {
          if (line.startsWith('event:')) {
            // Start of a new event, process the previous one if complete
            if (currentEvent && currentData) {
              await this.processEvent(
                currentEvent,
                currentData,
                logger,
                (message) => {
                  fullMessage = message;
                },
              );
            }
            currentEvent = line.replace(/^event:\s*/, '').trim();
            currentData = '';
          } else if (line.startsWith('data:')) {
            // Accumulate data for the current event
            currentData += line.replace(/^data:\s*/, '') + '\n';
          } else if (line.trim() === '') {
            // End of an event, process it
            if (currentEvent && currentData) {
              await this.processEvent(
                currentEvent,
                currentData,
                logger,
                (message) => {
                  fullMessage = message;
                },
              );
              currentEvent = '';
              currentData = '';
            }
          }
        }
        if (currentEvent && currentData) {
          await this.processEvent(
            currentEvent,
            currentData,
            logger,
            (message) => {
              fullMessage = message;
            },
          );
        }
        res.end();

        await this.messageService.saveMessageUser({
          conversation_id: conversation.id,
          sender_type: SenderType.CHATBOT,
          message_content: fullMessage,
          send_at: new Date(),
        });
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

  async processEvent(
    event: string,
    data: string,
    logger: Logger,
    setFullMessage: (message: string) => void,
  ) {
    if (event === 'conversation.message.completed') {
      try {
        // Remove trailing newlines and parse JSON
        const parsed = JSON.parse(data.trim());
        if (
          parsed.role === 'assistant' &&
          parsed.type === 'answer' &&
          parsed.content_type === 'text' &&
          typeof parsed.content === 'string'
        ) {
          logger.log('Found final assistant answer');
          setFullMessage(parsed.content);
        }
      } catch (err) {
        logger.error(`Failed to parse event data: ${err.message}`);
      }
    }
  }

  async chatWithBotEmbedStream(
    chatEmbedChatbot: ChatWithChatbotEmbedDto,
    res: Response,
  ) {
    const payload = await this.chatbotTokenService.verifyChatbotToken(
      chatEmbedChatbot.token,
    );
    if (
      !payload ||
      !payload?.userId ||
      !payload?.chatbotId ||
      !payload?.domainId
    ) {
      throw new UnauthorizedException('Invalid token');
    }

    const [user, chatbot, conversation] = await Promise.all([
      // Truy vấn user: Chỉ lấy các trường cần thiết
      this.userRepository.findOne({
        where: {
          id: payload.userId,
          status: UserStatus.ACTIVE,
        },
        relations: ['api_token'],
        select: {
          id: true,
          external_user_id: true,
          api_token: {
            id: true,
            token: true,
          },
        },
      }),
      // Truy vấn chatbot: Chỉ lấy id và user.id để kiểm tra quyền sở hữu
      this.chatbotRepository.findOne({
        where: { id: payload.chatbotId },
        select: {
          id: true,
          external_bot_id: true,
        },
      }),
      // Truy vấn conversation: Chỉ lấy id, external_conversation_id, và chatbot.user.id
      this.conversationRepository.findOne({
        where: { id: chatEmbedChatbot.conversation_id },
        select: {
          id: true,
          external_conversation_id: true,
        },
      }),
    ]);

    // Bước 3: Kiểm tra tồn tại
    if (!user) {
      throw new NotFoundException('User not found');
    }
    if (!chatbot) {
      throw new NotFoundException('Chatbot not found');
    }
    if (!conversation) {
      throw new NotFoundException('Conversation not found');
    }

    await this.messageService.saveMessageUser({
      conversation_id: chatEmbedChatbot.conversation_id,
      sender_type: SenderType.USER,
      message_content: chatEmbedChatbot.message,
      send_at: new Date(),
    });

    try {
      const response = await fetch(
        `https://api.coze.com/v3/chat?conversation_id=${conversation.external_conversation_id}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${user.api_token.token}`,
          },
          body: JSON.stringify({
            bot_id: chatbot.external_bot_id,
            user_id: user.external_user_id,
            stream: true,
            auto_save_history: true,
            additional_messages: [
              {
                role: 'user',
                content: chatEmbedChatbot.message,
                content_type: 'text',
              },
            ],
          }),
        },
      );

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
      const logger = new Logger('SSEPump');
      let currentEvent = '';
      let currentData = '';
      let data: any;

      const pump = async () => {
        let fullMessage = ''; // Dùng để tích luỹ nội dung cuối cùng
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          if (value) {
            const chunk = decoder.decode(value);
            data += decoder.decode(value);
            res.write(chunk);
          }
        }

        // Split chunk into lines to process SSE format
        const lines = data.split('\n');
        for (const line of lines) {
          if (line.startsWith('event:')) {
            // Start of a new event, process the previous one if complete
            if (currentEvent && currentData) {
              await this.processEvent(
                currentEvent,
                currentData,
                logger,
                (message) => {
                  fullMessage = message;
                },
              );
            }
            currentEvent = line.replace(/^event:\s*/, '').trim();
            currentData = '';
          } else if (line.startsWith('data:')) {
            // Accumulate data for the current event
            currentData += line.replace(/^data:\s*/, '') + '\n';
          } else if (line.trim() === '') {
            // End of an event, process it
            if (currentEvent && currentData) {
              await this.processEvent(
                currentEvent,
                currentData,
                logger,
                (message) => {
                  fullMessage = message;
                },
              );
              currentEvent = '';
              currentData = '';
            }
          }
        }
        if (currentEvent && currentData) {
          await this.processEvent(
            currentEvent,
            currentData,
            logger,
            (message) => {
              fullMessage = message;
            },
          );
        }
        res.end();

        await this.messageService.saveMessageUser({
          conversation_id: chatEmbedChatbot.conversation_id,
          sender_type: SenderType.CHATBOT,
          message_content: fullMessage,
          send_at: new Date(),
        });
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
    // Lấy model (sử dụng ID cố định hoặc từ DTO nếu có)
    const model = await this.chatbotModelsService.findOne('113');
    if (!model) {
      throw new NotFoundException('Model not found');
    }

    // Lấy user với quan hệ tối ưu
    const user = await this.userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.api_token', 'api_token')
      .leftJoinAndSelect('user.workspace', 'workspace')
      .where('user.id = :userId')
      .setParameter('userId', userId)
      .select([
        'user.id AS user_id',
        'api_token.id AS api_token_id',
        'api_token.token AS api_token_token',
        'workspace.id AS workspace_id',
        'workspace.external_space_id AS workspace_external_space_id',
      ])
      .getRawOne();

    if (!user) {
      throw new NotFoundException('User not found');
    }

    try {
      // Gọi API Coze để tạo chatbot
      const response = await fetch('https://api.coze.com/v1/bot/create', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${user.api_token_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          space_id: user.workspace_external_space_id,
          name: createChatbotDto.chatbot_name,
          description: createChatbotDto.description || null,
          model_info_config: createChatbotDto.model_info_config,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          `API call failed: ${errorData?.message || response.statusText}`,
        );
      }

      const data = await response.json();
      if (!data?.data?.bot_id) {
        throw new Error('API did not return a bot_id');
      }

      // Tạo và lưu chatbot
      const chatbot = this.chatbotRepository.create({
        chatbot_name: createChatbotDto.chatbot_name,
        user: { id: userId },
        model: { id: model.id },
        external_bot_id: data.data.bot_id,
        status: ChatbotStatus.DRAFT,
        description: createChatbotDto.description,
      });

      const savedChatbot = await this.chatbotRepository.save(chatbot);
      return savedChatbot;
    } catch (error) {
      console.error('Error creating chatbot:', error.message);
      throw new InternalServerErrorException(
        'Failed to create chatbot: ' + error.message,
      );
    }
  }

  async publishChatbotByUser(
    userId: string,
    chatbotId: string,
    publishChatbotDto: PublishChatbotDto,
  ) {
    // Lấy chatbot với quan hệ và kiểm tra quyền sở hữu
    const chatbot = await this.chatbotRepository
      .createQueryBuilder('chatbot')
      .leftJoinAndSelect('chatbot.user', 'user')
      .leftJoinAndSelect('user.api_token', 'api_token')
      .where('chatbot.id = :chatbotId')
      .andWhere('user.id = :userId')
      .setParameters({ chatbotId, userId })
      .getOne();

    if (!chatbot) {
      throw new NotFoundException('Chatbot not found');
    }

    if (!chatbot.external_bot_id) {
      throw new BadRequestException('Chatbot does not have an external bot ID');
    }

    if (!chatbot.user?.api_token?.token) {
      throw new BadRequestException('User API token is missing');
    }

    try {
      // Gọi API Coze để xuất bản chatbot
      const response = await fetch('https://api.coze.com/v1/bot/publish', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${chatbot.user.api_token.token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          bot_id: chatbot.external_bot_id,
          connector_ids: [publishChatbotDto.connector_id],
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          `API call failed: ${errorData?.message || response.statusText}`,
        );
      }

      const data = await response.json();
      if (!data?.data?.bot_id) {
        throw new Error('API did not return a bot_id');
      }

      await this.chatbotRepository.update(chatbot.id, {
        status: ChatbotStatus.PUBLISHED,
      });
      return data;
    } catch (error) {
      console.error('Error publishing chatbot:', error.message);
      throw new InternalServerErrorException(
        'Failed to publish chatbot: ' + error.message,
      );
    }
  }

  async findOne(id: string) {
    const chatbot = await this.chatbotRepository.findOne({
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
    // Kiểm tra workspace
    const workspace = await this.workspaceService.findWorkspaceByUserId(userId);
    if (!workspace) {
      throw new NotFoundException('Workspace not found');
    }

    // Lấy chatbot với quan hệ
    const chatbot = await this.chatbotRepository
      .createQueryBuilder('chatbot')
      .leftJoinAndSelect('chatbot.user', 'user')
      .leftJoinAndSelect('user.api_token', 'api_token')
      .leftJoinAndSelect('chatbot.model', 'model')
      .where('chatbot.id = :chatbotId')
      .andWhere('user.id = :userId')
      .setParameters({ chatbotId, userId })
      .getOne();

    if (!chatbot) {
      return false;
    }

    try {
      const response = await fetch('https://api.coze.com/v1/bot/create', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${chatbot.user.api_token.token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          space_id: workspace.external_space_id,
          name: chatbot.chatbot_name,
          description: updateChatbotDto.description || null,
        }),
      });

      const data = await response.json();
      if (!response.ok || !data?.data?.bot_id) {
        throw new Error(
          `API call failed: ${data?.message || 'No bot_id returned'}`,
        );
      }

      // Cập nhật chatbot
      chatbot.external_bot_id = data.data.bot_id;
      chatbot.description = updateChatbotDto.description ?? chatbot.description;
      const updatedChatbot = await this.chatbotRepository.save(chatbot);

      return updatedChatbot;
    } catch (error) {
      console.error('Error updating chatbot:', error.message);
      throw new InternalServerErrorException('Failed to update chatbot');
    }
  }

  async updateBasicInfoChatbot(
    userId: string,
    chatbotId: string,
    updateChatbotDto: UpdateChatbotDto,
  ) {
    // Lấy chatbot với quan hệ và kiểm tra quyền sở hữu
    const chatbot = await this.chatbotRepository
      .createQueryBuilder('chatbot')
      .leftJoinAndSelect('chatbot.user', 'user')
      .leftJoinAndSelect('user.api_token', 'api_token')
      .leftJoinAndSelect('chatbot.model', 'model')
      .where('chatbot.id = :chatbotId')
      .andWhere('user.id = :userId')
      .setParameters({ chatbotId, userId })
      .getOne();

    if (!chatbot) {
      throw new NotFoundException('Chatbot not found');
    }

    if (!chatbot.external_bot_id) {
      throw new BadRequestException('Chatbot does not have an external bot ID');
    }

    if (!chatbot.user?.api_token?.token) {
      throw new BadRequestException('User API token is missing');
    }

    try {
      // Gọi API Coze để cập nhật chatbot
      const response = await fetch('https://api.coze.com/v1/bot/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${chatbot.user.api_token.token}`,
        },
        body: JSON.stringify({
          bot_id: chatbot.external_bot_id,
          name: updateChatbotDto.chatbot_name,
          description: updateChatbotDto.description || chatbot.description,
          model_info_config: updateChatbotDto.model_info_config,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          `HTTP error! Status: ${response.status}, Message: ${errorData?.message || 'Unknown error'}`,
        );
      }

      const data = await response.json();
      if (data.code != 0) {
        throw new BadRequestException(
          `Cannot update external bot: ${data.message || 'Unknown error'}`,
        );
      }

      // Cập nhật chatbot
      chatbot.chatbot_name = updateChatbotDto.chatbot_name;
      chatbot.description = updateChatbotDto.description || chatbot.description;
      if (updateChatbotDto.model_info_config?.model_id) {
        chatbot.model = {
          id: updateChatbotDto.model_info_config.model_id,
        } as any;
      }

      const updatedChatbot = await this.chatbotRepository.save(chatbot);

      return updatedChatbot;
    } catch (error) {
      console.error('Error updating bot:', error.message);
      throw new InternalServerErrorException(
        `Failed to update chatbot: ${error.message}`,
      );
    }
  }

  async importKnowledge(
    userId: string,
    chatbotId: string,
    knowledgeDto: KnowledgeDto,
  ) {
    // Lấy chatbot với quan hệ và kiểm tra quyền sở hữu
    const chatbot = await this.chatbotRepository
      .createQueryBuilder('chatbot')
      .leftJoinAndSelect('chatbot.user', 'user')
      .leftJoinAndSelect('user.api_token', 'api_token')
      .where('chatbot.id = :chatbotId')
      .andWhere('user.id = :userId')
      .setParameters({ chatbotId, userId })
      .getOne();

    if (!chatbot) {
      throw new NotFoundException('Chatbot not found');
    }

    if (!chatbot.external_bot_id) {
      throw new BadRequestException('Chatbot does not have an external bot ID');
    }

    if (!chatbot.user?.api_token?.token) {
      throw new BadRequestException('User API token is missing');
    }

    try {
      // Gọi API Coze để cập nhật knowledge
      const response = await fetch('https://api.coze.com/v1/bot/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${chatbot.user.api_token.token}`,
        },
        body: JSON.stringify({
          bot_id: chatbot.external_bot_id,
          knowledge: knowledgeDto,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          `HTTP error! Status: ${response.status}, Message: ${errorData?.message || 'Unknown error'}`,
        );
      }

      const data = await response.json();
      if (data.code != 0) {
        throw new BadRequestException(
          `Cannot update external bot: ${data.message || 'Unknown error'}`,
        );
      }

      const externalResourceIds = knowledgeDto.dataset_ids;

      if (externalResourceIds.length > 0) {
        // Lấy resources tương ứng với external_resource_ids
        const matchedResources = await this.resourceRepository.find({
          where: { external_resource_id: In(externalResourceIds) },
          select: ['id', 'external_resource_id'],
        });

        if (matchedResources.length === 0) {
          throw new BadRequestException(
            'No matching resources found for the provided dataset IDs',
          );
        }

        const resourceIdMap = new Map(
          matchedResources.map((r) => [r.external_resource_id, r.id]),
        );

        // Lấy existing relations tối ưu bằng Query Builder
        const existingRelations = await this.chatbotResourceRepository
          .createQueryBuilder('chatbotResource')
          .leftJoinAndSelect('chatbotResource.resource', 'resource')
          .where('chatbotResource.chatbotId = :chatbotId', {
            chatbotId: chatbot.id,
          })
          .select(['chatbotResource.id', 'resource.id'])
          .getMany();

        const existingResourceIds = new Set(
          existingRelations.map((r) => r.resource.id),
        );

        // Tạo quan hệ mới
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
      throw new InternalServerErrorException(
        `Failed to update chatbot: ${error.message}`,
      );
    }
  }

  async importPrompt(
    userId: string,
    chatbotId: string,
    promptInfoDto: PromptInfoDto,
  ) {
    // Lấy chatbot với quan hệ và kiểm tra quyền sở hữu
    const chatbot = await this.chatbotRepository
      .createQueryBuilder('chatbot')
      .leftJoinAndSelect('chatbot.user', 'user')
      .leftJoinAndSelect('user.api_token', 'api_token')
      .where('chatbot.id = :chatbotId')
      .andWhere('user.id = :userId')
      .setParameters({ chatbotId, userId })
      .getOne();

    if (!chatbot) {
      throw new NotFoundException('Chatbot not found');
    }

    if (!chatbot.external_bot_id) {
      throw new BadRequestException('Chatbot does not have an external bot ID');
    }

    if (!chatbot.user?.api_token?.token) {
      throw new BadRequestException('User API token is missing');
    }

    try {
      // Gọi API Coze để cập nhật prompt
      const response = await fetch('https://api.coze.com/v1/bot/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${chatbot.user.api_token.token}`,
        },
        body: JSON.stringify({
          bot_id: chatbot.external_bot_id,
          prompt_info: {
            prompt: promptInfoDto.prompt_info,
          },
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          `HTTP error! Status: ${response.status}, Message: ${errorData?.message || 'Unknown error'}`,
        );
      }

      const data = await response.json();
      if (data.code != 0) {
        throw new BadRequestException(
          `Cannot update external bot: ${data.message || 'Unknown error'}`,
        );
      }

      // Cập nhật chatbot
      chatbot.prompt_info = promptInfoDto.prompt_info;
      const updatedChatbot = await this.chatbotRepository.save(chatbot);

      return updatedChatbot;
    } catch (error) {
      console.error('Error updating bot:', error.message);
      throw new InternalServerErrorException(
        `Failed to update chatbot: ${error.message}`,
      );
    }
  }

  async createOnboarding(
    userId: string,
    chatbotId: string,
    createChatbotOnboardingDto: CreateChatbotOnboardingDto,
  ) {
    // Lấy chatbot với quan hệ và kiểm tra quyền sở hữu
    const chatbot = await this.chatbotRepository
      .createQueryBuilder('chatbot')
      .leftJoinAndSelect('chatbot.user', 'user')
      .leftJoinAndSelect('user.api_token', 'api_token')
      .where('chatbot.id = :chatbotId')
      .andWhere('user.id = :userId')
      .setParameters({ chatbotId, userId })
      .getOne();

    if (!chatbot) {
      throw new NotFoundException('Chatbot not found');
    }

    if (!chatbot.external_bot_id) {
      throw new BadRequestException('Chatbot does not have an external bot ID');
    }

    if (!chatbot.user?.api_token?.token) {
      throw new BadRequestException('User API token is missing');
    }

    // Tạo onboardingInfo
    const onboardingInfo: Record<string, any> = {
      prologue: createChatbotOnboardingDto.prologue,
    };

    if (
      Array.isArray(createChatbotOnboardingDto.suggested_questions) &&
      createChatbotOnboardingDto.suggested_questions.length > 0
    ) {
      const questions = createChatbotOnboardingDto.suggested_questions;
      if (
        questions.some((q) => !q.question || typeof q.position !== 'number')
      ) {
        throw new BadRequestException(
          'Suggested questions must have valid question and position',
        );
      }
      onboardingInfo.suggested_questions = questions.map((q) => q.question);
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Gọi API Coze để cập nhật onboarding_info
      const response = await fetch('https://api.coze.com/v1/bot/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${chatbot.user.api_token.token}`,
        },
        body: JSON.stringify({
          bot_id: chatbot.external_bot_id,
          onboarding_info: onboardingInfo,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          `HTTP error! Status: ${response.status}, Message: ${errorData?.message || 'Unknown error'}`,
        );
      }

      const data = await response.json();
      if (data.code !== 0) {
        throw new BadRequestException(
          `Cannot update external bot: ${data.message || 'Unknown error'}`,
        );
      }

      // Lưu ChatbotOnboarding
      const newOnboarding = this.chatbotOnboardingRepository.create({
        ...createChatbotOnboardingDto,
        chatbot,
      });
      await queryRunner.manager.save(newOnboarding);

      // Lưu suggested_questions nếu có
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
        await queryRunner.manager.save(questionsToSave);
      }

      await queryRunner.commitTransaction();
      return { success: true, data: newOnboarding };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      console.error('Error creating onboarding:', error.message);
      throw new InternalServerErrorException(
        `Failed to create onboarding: ${error.message}`,
      );
    } finally {
      await queryRunner.release();
    }
  }

  async updateChatbotOnboarding(
    userId: string,
    chatbotId: string,
    onboardingId: string,
    updateChatbotOnboardingDto: UpdateChatbotOnboardingDto,
  ) {
    const { prologue, suggested_questions = [] } = updateChatbotOnboardingDto;

    // Lấy chatbot với quan hệ và kiểm tra quyền sở hữu
    const chatbot = await this.chatbotRepository
      .createQueryBuilder('chatbot')
      .leftJoinAndSelect('chatbot.user', 'user')
      .leftJoinAndSelect('user.api_token', 'api_token')
      .leftJoinAndSelect('chatbot.onboarding', 'onboarding')
      .where('chatbot.id = :chatbotId')
      .andWhere('user.id = :userId')
      .andWhere('onboarding.id = :onboardingId')
      .setParameters({ chatbotId, userId, onboardingId })
      .getOne();

    if (!chatbot || !chatbot.onboarding) {
      throw new NotFoundException('Chatbot or onboarding not found');
    }

    if (!chatbot.external_bot_id) {
      throw new BadRequestException('External bot ID is missing');
    }

    if (!chatbot.user?.api_token?.token) {
      throw new BadRequestException('User API token is missing');
    }

    const onboardingInfo: Record<string, any> = {};
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Cập nhật prologue nếu có
      if (prologue !== undefined) {
        await queryRunner.manager.update(ChatbotOnboarding, onboardingId, {
          prologue,
        });
        onboardingInfo.prologue = prologue;
      }

      // Xóa suggested questions cũ
      await queryRunner.manager.delete(OnboardingSuggestedQuestion, {
        chatbot_onboarding: { id: onboardingId },
      });

      // Thêm suggested questions mới nếu có
      if (
        Array.isArray(suggested_questions) &&
        suggested_questions.length > 0
      ) {
        const newQuestions = suggested_questions.map((q) => ({
          position: q.position,
          question: q.question,
          chatbot_onboarding: { id: onboardingId },
        }));
        await queryRunner.manager.insert(
          OnboardingSuggestedQuestion,
          newQuestions,
        );
        onboardingInfo.suggested_questions = suggested_questions.map(
          (q) => q.question,
        );
      }

      // Gọi API Coze nếu có thay đổi
      if (Object.keys(onboardingInfo).length > 0) {
        const response = await fetch('https://api.coze.com/v1/bot/update', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${chatbot.user.api_token.token}`,
          },
          body: JSON.stringify({
            bot_id: chatbot.external_bot_id,
            onboarding_info: onboardingInfo,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(
            `HTTP error! Status: ${response.status}, Message: ${errorData?.message || 'Unknown error'}`,
          );
        }

        const data = await response.json();
        if (data.code !== 0) {
          throw new BadRequestException(
            `Cannot update external bot: ${data.message || 'Unknown error'}`,
          );
        }
      }

      await queryRunner.commitTransaction();

      // Lấy thông tin onboarding đã cập nhật
      const updatedOnboarding = await this.chatbotOnboardingRepository
        .createQueryBuilder('onboarding')
        .leftJoinAndSelect(
          'onboarding.suggested_questions',
          'suggested_questions',
        )
        .where('onboarding.id = :id', { id: onboardingId })
        .getOne();

      return updatedOnboarding;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      console.error('Error updating onboarding:', error.message);
      throw new InternalServerErrorException(
        `Failed to update onboarding: ${error.message}`,
      );
    } finally {
      await queryRunner.release();
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
