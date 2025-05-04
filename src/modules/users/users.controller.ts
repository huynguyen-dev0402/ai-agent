import { Subscription } from '@modules/subscriptions/entities/subscription.entity';
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  ValidationPipe,
  BadRequestException,
  NotFoundException,
  Req,
  UseInterceptors,
  UploadedFile,
  Query,
} from '@nestjs/common';
import { UsersService } from '@modules/users/users.service';
import { CreateUserDto } from '@modules/users/dto/create-user.dto';
import { UpdateUserDto } from '@modules/users/dto/update-user.dto';
import { AuthGuard } from '@modules/auth/guards/jwt-auth.guard';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { User } from './entities/user.entity';
import { WorkspacesService } from '@modules/workspaces/workspaces.service';
import { CreateChatbotDto } from '@modules/chatbots/dto/create-chatbot.dto';
import { ChatbotsService } from '@modules/chatbots/chatbots.service';
import { UpdateChatbotDto } from '@modules/chatbots/dto/update-chatbot.dto';
import { PublishChatbotDto } from '@modules/chatbots/dto/publish-chatbot.dto';
import { ResourcesService } from '@modules/resources/resources.service';
import { CreateResourceDto } from '@modules/resources/dto/create-resource.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { extname } from 'path';
import { UploadMultiDto } from '@modules/documents/dto/upload-multi.dto';
import { DocumentsService } from '@modules/documents/documents.service';
import { GetDocumentDto } from '@modules/documents/dto/get-document.dto';
import { ChatbotPromptService } from '@modules/chatbot-prompt/chatbot-prompt.service';
import { PromptInfoDto } from '@modules/chatbots/dto/prompt.dto';
import { KnowledgeDto } from '@modules/chatbots/dto/knowledge.dto';
import { CreateChatbotOnboardingDto } from '@modules/chatbot-onboarding/dto/create-chatbot-onboarding.dto';
import { UpdateChatbotOnboardingDto } from '@modules/chatbot-onboarding/dto/update-chatbot-onboarding.dto';
import { UserIdMatchGuard } from '@common/guards/user-id-match.guard';
import { successResponse } from '@common/utils/response/response.util';
import { Chatbot } from '@modules/chatbots/entities/chatbot.entity';
import { Resource } from '@modules/resources/entities/resource.entity';
import { Workspace } from '@modules/workspaces/entities/workspace.entity';
import { SubscriptionsService } from '@modules/subscriptions/subscriptions.service';
import { UserSubscriptionsService } from '@modules/user-subscriptions/user-subscriptions.service';
import { CheckQuota } from '@common/decorators/check-quota.decorator';
import {
  ResourceType,
  UsageAction,
} from '@modules/usage-logs/entities/usage-log.entity';
import { CheckQuotaInterceptor } from '@common/interceptors/usage-logs.interceptor';
import { QUANTITY_REDUCE } from '@common/constants/quantity.constant';
import { ChatbotTokensService } from '@modules/chatbot-tokens/chatbot-tokens.service';

@Controller('users')
@UseGuards(AuthGuard)
@ApiTags('Users')
@ApiBearerAuth('access-token')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly chatbotService: ChatbotsService,
    private readonly workspaceService: WorkspacesService,
    private readonly resourceService: ResourcesService,
    private readonly documentService: DocumentsService,
    private readonly chatbotPromptService: ChatbotPromptService,
    private readonly subscriptionService: SubscriptionsService,
    private readonly userSubscriptionService: UserSubscriptionsService,
    private readonly chatbotTokenService: ChatbotTokensService,
  ) {}

  @Get('/profile/api-token')
  @ApiOperation({ summary: 'Get or create API Token for authenticated user' })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved or created API Token.',
  })
  @ApiResponse({ status: 400, description: 'Failed to create API Token.' })
  async createApiToken(
    @Req() request: Request & { user: { [key: string]: string } },
  ) {
    const token = await this.usersService.getApiTokenForUser(request.user.id);
    if (!token) {
      throw new BadRequestException('Unable to create API Token.');
    }
    return {
      success: true,
      message: 'API Token retrieved or created successfully.',
      token,
    };
  }

  @Post('/:id/chatbots')
  @UseGuards(UserIdMatchGuard)
  @UseInterceptors(CheckQuotaInterceptor) // Áp dụng interceptor để ghi log usage
  @CheckQuota({
    resourceType: ResourceType.AGENT,
    action: UsageAction.CREATE,
    quantity: QUANTITY_REDUCE, // Số lượng sử dụng, mặc định là 1
  })
  @ApiOperation({ summary: 'Create a chatbot' })
  @ApiParam({ name: 'userId', required: true, description: 'ID of the user' })
  @ApiResponse({ status: 201, description: 'Chatbot created successfully.' })
  @ApiResponse({ status: 400, description: 'Failed to create chatbot.' })
  async createChatbotByUser(
    @Param('id') id: string,
    @Body(new ValidationPipe()) createChatbotDto: CreateChatbotDto,
  ) {
    const newChatbot = await this.chatbotService.createChatbotByUser(
      id,
      createChatbotDto,
    );
    if (!newChatbot) {
      throw new BadRequestException('Failed to create chatbot.');
    }
    return successResponse('Chatbot created successfully.', newChatbot);
  }

  @Patch('/:userId/chatbots/:chatbotId')
  @UseGuards(UserIdMatchGuard)
  @ApiOperation({ summary: 'Update a chatbot' })
  @ApiParam({ name: 'userId', required: true, description: 'ID of the user' })
  @ApiParam({
    name: 'chatbotId',
    required: true,
    description: 'ID of the chatbot',
  })
  @ApiResponse({ status: 200, description: 'Chatbot updated successfully.' })
  @ApiResponse({ status: 400, description: 'Failed to update chatbot.' })
  async updateChatbotByUser(
    @Param('userId') id: string,
    @Param('chatbotId') chatbotId: string,
    @Body(new ValidationPipe()) updateChatbotDto: UpdateChatbotDto,
  ) {
    const updatedChatbot = await this.chatbotService.updateChatbotByUser(
      id,
      chatbotId,
      updateChatbotDto,
    );
    if (!updatedChatbot) {
      throw new BadRequestException('Failed to update chatbot.');
    }
    return successResponse('Chatbot updated successfully.', updatedChatbot);
  }

  @Patch('/:userId/chatbots/:chatbotId/config-basic')
  @UseGuards(UserIdMatchGuard)
  @ApiOperation({ summary: 'Update basic configuration of chatbot' })
  @ApiParam({ name: 'userId', required: true, description: 'ID of the user' })
  @ApiParam({
    name: 'chatbotId',
    required: true,
    description: 'ID of the chatbot',
  })
  @ApiResponse({ status: 200, description: 'Basic info updated successfully.' })
  @ApiResponse({ status: 400, description: 'Failed to update basic info.' })
  async configChatbotByUser(
    @Param('chatbotId') chatbotId: string,
    @Body(new ValidationPipe()) updateChatbotDto: UpdateChatbotDto,
  ) {
    const updatedChatbot = await this.chatbotService.updateBasicInfoChatbot(
      chatbotId,
      updateChatbotDto,
    );

    if (!updatedChatbot) {
      throw new BadRequestException('Failed to update basic chatbot info.');
    }
    return successResponse(
      'Basic chatbot information updated successfully.',
      updatedChatbot,
    );
  }

  @Patch('/:userId/chatbots/:chatbotId/import-prompts')
  @UseGuards(UserIdMatchGuard)
  @ApiOperation({ summary: 'Import prompt to chatbot' })
  @ApiParam({ name: 'userId', required: true, description: 'ID of the user' })
  @ApiParam({
    name: 'chatbotId',
    required: true,
    description: 'ID of the chatbot',
  })
  @ApiResponse({ status: 200, description: 'Prompt imported successfully.' })
  @ApiResponse({ status: 400, description: 'Failed to import prompt.' })
  async importPrompt(
    @Param('chatbotId') chatbotId: string,
    @Body(new ValidationPipe()) promptInfoDto: PromptInfoDto,
  ) {
    const updatedChatbot = await this.chatbotService.importPrompt(
      chatbotId,
      promptInfoDto,
    );

    if (!updatedChatbot) {
      throw new BadRequestException('Failed to import prompt to chatbot.');
    }
    return successResponse(
      'Prompt imported to chatbot successfully.',
      updatedChatbot,
    );
  }

  @Patch('/:userId/chatbots/:chatbotId/import-documents')
  @UseGuards(UserIdMatchGuard)
  @ApiOperation({ summary: 'Import knowledge to chatbot' })
  @ApiParam({ name: 'userId', required: true, description: 'ID of the user' })
  @ApiParam({
    name: 'chatbotId',
    required: true,
    description: 'ID of the chatbot',
  })
  @ApiResponse({
    status: 200,
    description: 'Knowledge imported successfully.',
  })
  @ApiResponse({ status: 400, description: 'Failed to import knowledge.' })
  async importKnowledge(
    @Param('chatbotId') chatbotId: string,
    @Body(new ValidationPipe()) knowledgeDto: KnowledgeDto,
  ) {
    const updatedChatbot = await this.chatbotService.importKnowledge(
      chatbotId,
      knowledgeDto,
    );

    if (!updatedChatbot) {
      throw new BadRequestException('Failed to import knowledge to chatbot.');
    }
    return successResponse('Knowledge imported to chatbot successfully.');
  }

  @Post('/:userId/chatbots/:chatbotId/onboarding')
  @UseGuards(UserIdMatchGuard)
  @ApiOperation({ summary: 'Create onboarding for chatbot' })
  @ApiParam({ name: 'userId', required: true, description: 'ID of the user' })
  @ApiParam({
    name: 'chatbotId',
    required: true,
    description: 'ID of the chatbot',
  })
  @ApiResponse({
    status: 200,
    description: 'Onboarding created successfully.',
  })
  @ApiResponse({ status: 400, description: 'Failed to create onboarding.' })
  async createOnboarding(
    @Param('chatbotId') chatbotId: string,
    @Body(new ValidationPipe())
    createChatbotOnboardingDto: CreateChatbotOnboardingDto,
  ) {
    const updatedChatbot = await this.chatbotService.createOnboarding(
      chatbotId,
      createChatbotOnboardingDto,
    );

    if (!updatedChatbot) {
      throw new BadRequestException('Failed to create onboarding for chatbot.');
    }
    return successResponse(
      'Onboarding for chatbot created successfully.',
      updatedChatbot,
    );
  }

  @Patch('/:userId/chatbots/:chatbotId/onboarding/:onboardingId')
  @UseGuards(UserIdMatchGuard)
  @ApiOperation({ summary: 'Update onboarding for chatbot' })
  @ApiParam({ name: 'userId', required: true, description: 'ID of the user' })
  @ApiParam({
    name: 'chatbotId',
    required: true,
    description: 'ID of the chatbot',
  })
  @ApiParam({
    name: 'onboardingId',
    required: true,
    description: 'ID of the onboarding item',
  })
  @ApiResponse({
    status: 200,
    description: 'Onboarding updated successfully.',
  })
  @ApiResponse({ status: 400, description: 'Failed to update onboarding.' })
  async updateOnboarding(
    @Param('chatbotId') chatbotId: string,
    @Param('onboardingId') onboardingId: string,
    @Body(new ValidationPipe())
    updateChatbotOnboardingDto: UpdateChatbotOnboardingDto,
  ) {
    const updatedChatbot = await this.chatbotService.updateChatbotOnboarding(
      chatbotId,
      onboardingId,
      updateChatbotOnboardingDto,
    );

    if (!updatedChatbot) {
      throw new BadRequestException('Failed to update onboarding for chatbot.');
    }

    return successResponse(
      'Onboarding for chatbot updated successfully.',
      updatedChatbot,
    );
  }

  @Post('/:userId/chatbots/:chatbotId/publish')
  @UseGuards(UserIdMatchGuard)
  @ApiOperation({ summary: 'Publish a chatbot' })
  @ApiParam({ name: 'userId', required: true, description: 'ID of the user' })
  @ApiParam({
    name: 'chatbotId',
    required: true,
    description: 'ID of the chatbot',
  })
  @ApiResponse({
    status: 200,
    description: 'Chatbot published successfully.',
  })
  @ApiResponse({ status: 400, description: 'Failed to publish chatbot.' })
  async publishChatbotByUser(
    @Param('chatbotId') chatbotId: string,
    @Body(new ValidationPipe()) publishChatbotDto: PublishChatbotDto,
  ) {
    const publishedChatbot = await this.chatbotService.publishChatbotByUser(
      chatbotId,
      publishChatbotDto,
    );

    if (!publishedChatbot) {
      throw new BadRequestException(
        `Failed to publish chatbot with ID: ${chatbotId}`,
      );
    }

    return successResponse('Chatbot published successfully.', publishedChatbot);
  }

  @Post('/:userId/resources')
  @UseGuards(UserIdMatchGuard)
  @ApiOperation({ summary: 'Create resource for user' })
  @ApiParam({ name: 'userId', required: true, description: 'ID of the user' })
  @ApiResponse({
    status: 200,
    description: 'Resource created successfully.',
  })
  @ApiResponse({ status: 400, description: 'Failed to create resource.' })
  async createResource(
    @Param('userId') id: string,
    @Body(new ValidationPipe()) createResourceDto: CreateResourceDto,
  ) {
    const createdResource = await this.resourceService.createResourceForUser(
      id,
      createResourceDto,
    );

    if (!createdResource) {
      throw new BadRequestException(
        `Failed to create resource for space_id: ${createResourceDto.external_space_id}`,
      );
    }

    return successResponse('Resource created successfully.', createdResource);
  }

  @Post('/:userId/resources/:resourceId/documents/')
  @UseGuards(UserIdMatchGuard)
  @ApiOperation({ summary: 'Get list of documents for a resource' })
  @ApiParam({ name: 'userId', required: true, description: 'ID of the user' })
  @ApiParam({
    name: 'resourceId',
    required: true,
    description: 'ID of the resource',
  })
  @ApiResponse({
    status: 200,
    description: 'Documents retrieved successfully.',
  })
  @ApiResponse({ status: 400, description: 'Failed to retrieve documents.' })
  async getListDocument(
    @Param('resourceId') resourceId: string,
    @Body(new ValidationPipe()) getDocumentDto: GetDocumentDto,
  ) {
    const listDocument = await this.documentService.getListDocumentForUser(
      resourceId,
      getDocumentDto,
    );

    if (!listDocument) {
      throw new BadRequestException('Failed to retrieve documents.');
    }

    return successResponse('Documents retrieved successfully.', listDocument);
  }

  @Post('/:userId/prompts')
  @UseGuards(UserIdMatchGuard)
  @ApiOperation({ summary: 'Create prompts for chatbot' })
  @ApiParam({ name: 'userId', required: true, description: 'ID of the user' })
  @ApiResponse({
    status: 201,
    description: 'Prompts created successfully.',
  })
  @ApiResponse({ status: 400, description: 'Failed to create prompts.' })
  async createPromptChatbotForUser(
    @Param('userId') id: string,
    @Body(new ValidationPipe()) promptInfoDto: PromptInfoDto,
  ) {
    const prompt = await this.chatbotPromptService.createPromptChatbotForUser(
      id,
      promptInfoDto,
    );

    if (!prompt) {
      throw new BadRequestException(`Failed to create prompts for user: ${id}`);
    }

    return successResponse('Prompts created successfully.', prompt);
  }

  @Post('/:userId/resources/:resourceId/documents/images')
  @UseGuards(UserIdMatchGuard)
  @ApiOperation({ summary: 'Get list of images uploaded for a resource' })
  @ApiParam({ name: 'userId', required: true, description: 'ID of the user' })
  @ApiParam({
    name: 'resourceId',
    required: true,
    description: 'ID of the resource',
  })
  @ApiResponse({
    status: 200,
    description: 'Images retrieved successfully.',
  })
  @ApiResponse({ status: 400, description: 'Failed to retrieve images.' })
  async getListImagesUploaded(
    @Param('resourceId') resourceId: string,
    @Body(new ValidationPipe()) getDocumentDto: GetDocumentDto,
  ) {
    const listDocument = await this.documentService.getListDocumentForUser(
      resourceId,
      getDocumentDto,
    );

    if (!listDocument) {
      throw new BadRequestException('Failed to retrieve images.');
    }

    return successResponse('Images retrieved successfully.', listDocument);
  }

  @Post('/:id/endcode-files')
  @UseGuards(UserIdMatchGuard)
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: 10 * 1024 * 1024 }, // Max file size: 10MB
      fileFilter: (req, file, cb) => {
        const allowedExt = ['.txt', '.pdf', '.doc', '.docx'];
        const fileExt = extname(file.originalname).toLowerCase();
        if (!allowedExt.includes(fileExt)) {
          return cb(new BadRequestException('Invalid file type'), false);
        }
        cb(null, true);
      },
    }),
  )
  async encodeFileBase64(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    const fileExt = extname(file.originalname).toLowerCase(); // e.g., ".txt"
    const extension = fileExt.replace('.', ''); // e.g., "txt"
    const base64 = file.buffer.toString('base64');
    const dataUrl = `data:${file.mimetype};base64,${base64}`;

    return {
      filename: file.originalname,
      mimetype: extension,
      base64,
      dataUrl,
    };
  }

  @Post('/:userId/resources/:resourceId/documents/files')
  @UseGuards(UserIdMatchGuard)
  @UseInterceptors(CheckQuotaInterceptor) // Áp dụng interceptor để ghi log usage
  @CheckQuota({
    resourceType: ResourceType.KNOWLEDGE,
    action: UsageAction.CREATE,
    quantity: QUANTITY_REDUCE, // Số lượng sử dụng, mặc định là 1
  })
  @ApiOperation({ summary: 'Upload file to resource' })
  @ApiParam({ name: 'userId', required: true, description: 'ID of the user' })
  @ApiParam({
    name: 'resourceId',
    required: true,
    description: 'ID of the resource',
  })
  @ApiResponse({
    status: 201,
    description: 'File has been successfully uploaded to resource.',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid request or file upload failed.',
  })
  async uploadFileLocalToResource(
    @Param('resourceId') resourceId: string,
    @Body(new ValidationPipe()) uploadMultiDto: UploadMultiDto,
  ) {
    if (uploadMultiDto.file_type) {
      const uploadedResource = await this.resourceService.uploadDocument(
        resourceId,
        uploadMultiDto,
      );

      if (!uploadedResource) {
        throw new BadRequestException(
          `Failed to upload document to resource: ${resourceId}`,
        );
      }

      return successResponse(
        'Document uploaded successfully.',
        uploadedResource,
      );
    }

    if (uploadMultiDto.document_source) {
      const uploadedResource = await this.resourceService.uploadImageDocument(
        resourceId,
        uploadMultiDto,
      );

      if (!uploadedResource) {
        throw new BadRequestException(
          `Failed to upload image document to resource: ${resourceId}`,
        );
      }

      return successResponse(
        'Image document uploaded successfully.',
        uploadedResource,
      );
    }

    // If neither file_type nor document_source is provided, return an error.
    throw new BadRequestException(
      'Invalid request: Missing file type or document source.',
    );
  }

  @Post()
  @ApiOperation({ summary: 'Create a new user' })
  @ApiResponse({
    status: 201,
    description: 'The user has been successfully created.',
  })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  async create(@Body(new ValidationPipe()) createUserDto: CreateUserDto) {
    const user = await this.usersService.create(createUserDto);
    if (!user) {
      throw new BadRequestException('Cannot create user');
    }
    return user;
  }

  @Get()
  @ApiOperation({ summary: 'Get all users' })
  @ApiResponse({ status: 200, description: 'List of all users', type: [User] })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async findAll() {
    const users = await this.usersService.findAll();
    if (!users) {
      throw new NotFoundException('Users not found');
    }
    return {
      success: true,
      message: 'User found successfully',
      users,
    };
  }

  @Get('/profile')
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Get user information' })
  @ApiResponse({
    status: 200,
    description: 'User information retrieved successfully',
    type: User,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getInfoUser(
    @Req() request: Request & { user: { [key: string]: string } },
  ) {
    const user = await this.usersService.findOne(request.user.id);
    return {
      success: true,
      message: 'User information retrieved successfully',
      user,
    };
  }

  @Get('/profile/workspaces')
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Get workspaces information' })
  @ApiResponse({
    status: 200,
    description: 'Workspaces retrieved successfully',
    type: [Workspace],
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async findAllWorkspacesForUser(
    @Req() request: Request & { user: { [key: string]: string } },
  ) {
    const workspaces = await this.workspaceService.findWorkspaceByUserId(
      request.user.id,
    );
    return {
      success: true,
      message: 'Workspaces retrieved successfully',
      workspaces,
    };
  }

  @Get('/profile/resources')
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Get resources information' })
  @ApiResponse({
    status: 200,
    description: 'Resources retrieved successfully',
    type: [Resource],
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async findAllResourceForUser(
    @Req() request: Request & { user: { [key: string]: string } },
  ) {
    const resources = await this.usersService.findAllResourceForUser(
      request.user.id,
    );
    return {
      success: true,
      message: 'Resources retrieved successfully',
      resources,
    };
  }

  @Get('/profile/subscription')
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Get subscriptions' })
  @ApiResponse({
    status: 200,
    description: 'Subscriptions retrieved successfully',
    type: Subscription,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getSubscriptions(
    @Req() request: Request & { user: { [key: string]: string } },
  ) {
    const userSubscription = await this.userSubscriptionService.findOneForUser(
      request.user.id,
    );
    if (!userSubscription) {
      throw new NotFoundException('No active subscription found for this user');
    }
    return {
      success: true,
      message: 'Subscriptions retrieved successfully',
      userSubscription,
    };
  }

  @Get('/profile/chatbot-token')
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Get chatbot tokens for the authenticated user' })
  @ApiResponse({
    status: 200,
    description: 'Chatbot tokens retrieved successfully',
    schema: {
      example: {
        success: true,
        message: 'Subscriptions retrieved successfully',
        chatbotTokens: [
          {
            id: 'e41d3b2f-5e2a-4b9d-a786-18f0a9f6f1b9',
            token: 'abc123xyz456',
            expires_at: '2025-12-31T23:59:59.000Z',
            created_at: '2025-01-01T10:00:00.000Z',
            updated_at: '2025-04-01T12:00:00.000Z',
            user: {
              id: 'user-id-example',
              // other user fields if included
            },
            chatbot: {
              id: 'chatbot-id-example',
              // other chatbot fields if included
            },
          },
        ],
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 404,
    description: 'No active subscription found for this user',
  })
  async getChatbotToken(
    @Req() request: Request & { user: { [key: string]: string } },
  ) {
    const chatbotTokens = await this.chatbotTokenService.getTokenForUser(
      request.user.id,
    );
    if (!chatbotTokens.length) {
      throw new NotFoundException('No active subscription found for this user');
    }
    return {
      success: true,
      message: 'Subscriptions retrieved successfully',
      chatbotTokens,
    };
  }

  @Get('/profile/subscription/limits')
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Get subscriptions limits' })
  @ApiResponse({
    status: 200,
    description: 'Subscriptions retrieved successfully',
    type: Subscription,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiQuery({
    name: 'startDate',
    required: true,
    type: String,
    description:
      'The start date for filtering subscriptions, in the format YYYY-MM-DD',
  })
  @ApiQuery({
    name: 'endDate',
    required: true,
    type: String,
    description:
      'The end date for filtering subscriptions, in the format YYYY-MM-DD',
  })
  async getSubscriptionsLimits(
    @Req() request: Request & { user: { [key: string]: string } },
    @Query('startDate') startDateStr: string,
    @Query('endDate') endDateStr: string,
  ) {
    const startDate = new Date(startDateStr);
    const endDate = new Date(endDateStr);
    // Normalize startDate: 00:00:00.000
    startDate.setHours(0, 0, 0, 0);

    // Normalize endDate: 23:59:59.999
    endDate.setHours(23, 59, 59, 999);
    const remainingLimits = await this.subscriptionService.getRemainingLimits(
      request.user.id,
      startDate,
      endDate,
    );

    return {
      success: true,
      message: 'Subscriptions retrieved successfully',
      remainingLimits,
    };
  }

  @Get('/profile/resources/:resourceId')
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Get a single resource information' })
  @ApiParam({
    name: 'resourceId',
    required: true,
    description: 'ID of the resource',
  })
  @ApiResponse({
    status: 200,
    description: 'Resource retrieved successfully',
    type: Resource,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async findOneResourceForUser(
    @Param('resourceId') resourceId: string,
    @Req() request: Request & { user: { [key: string]: string } },
  ) {
    const resource = await this.resourceService.findOneResourceForUser(
      request.user.id,
      resourceId,
    );
    return {
      success: true,
      message: 'Resource retrieved successfully',
      resource,
    };
  }

  @Get('/profile/chatbots')
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Get list of chatbots for user' })
  @ApiResponse({
    status: 200,
    description: 'Chatbots list retrieved successfully',
    type: [Chatbot],
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async findAllChatbotsForUser(
    @Req() request: Request & { user: { [key: string]: string } },
  ) {
    const chatbots = await this.chatbotService.findAllChatbotsForUser(
      request.user.id,
    );
    return {
      success: true,
      message: 'Chatbots retrieved successfully',
      chatbots,
    };
  }

  @Get('/profile/chatbots/:chatbotId')
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Get details of a specific chatbot' })
  @ApiParam({
    name: 'chatbotId',
    required: true,
    description: 'ID of the chatbot',
  })
  @ApiResponse({
    status: 200,
    description: 'Chatbot details retrieved successfully',
    type: Chatbot,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async findChatbotForUser(
    @Param('chatbotId') chatbotId: string,
    @Req() request: Request & { user: { [key: string]: string } },
  ) {
    const chatbot = await this.chatbotService.findChatbotForUser(
      request.user.id,
      chatbotId,
    );
    return {
      success: true,
      message: 'Chatbot retrieved successfully',
      chatbot,
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a user by ID' })
  @ApiResponse({ status: 200, description: 'The found user', type: User })
  @ApiResponse({ status: 404, description: 'User not found' })
  async findOne(@Param('id') id: string) {
    if (!id) {
      throw new BadRequestException('ID is not empty or invalid');
    }
    const user = await this.usersService.findOne(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return {
      success: true,
      message: 'User found successfully',
      user,
    };
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a user' })
  @ApiResponse({
    status: 200,
    description: 'The user has been successfully updated.',
  })
  @ApiResponse({ status: 404, description: 'User not found' })
  update(
    @Param('id') id: string,
    @Body(new ValidationPipe()) updateUserDto: UpdateUserDto,
  ) {
    return this.usersService.update(id, updateUserDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a user' })
  @ApiResponse({
    status: 200,
    description: 'The user has been successfully deleted.',
  })
  @ApiResponse({ status: 404, description: 'User not found' })
  async remove(@Param('id') id: string) {
    if (!id) {
      throw new BadRequestException('Please provide id to delete users');
    }
    const { response, user } = await this.usersService.remove(id);
    if (!user) {
      throw new NotFoundException(`User not found with id: ${id}`);
    }
    if (response && response.affected) {
      return {
        success: true,
        message: `User deleted successfully with id: ${id}`,
        user: user,
      };
    }
  }

  @Delete()
  async removeManyUser(@Body() ids: number[]) {
    if (!ids?.length || !ids) {
      throw new BadRequestException('Please provide ids to delete users');
    }
    const { response, users } = await this.usersService.removeManyUser(ids);
    if (users.length === 0) {
      throw new NotFoundException(`User not found with id: ${ids}`);
    }
    if (response && response.affected) {
      return {
        success: true,
        message: `Users deleted successfully with id: ${ids}`,
        users: users,
      };
    }
  }
}
