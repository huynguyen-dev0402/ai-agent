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
  UnauthorizedException,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { AuthGuard } from '../auth/guards/jwt-auth.guard';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { User } from './entities/user.entity';
import { WorkspacesService } from '../workspaces/workspaces.service';
import { CreateChatbotDto } from '../chatbots/dto/create-chatbot.dto';
import { ChatbotsService } from '../chatbots/chatbots.service';
import { UpdateChatbotDto } from '../chatbots/dto/update-chatbot.dto';
import { PublishChatbotDto } from '../chatbots/dto/publish-chatbot.dto';
import { ChatWithChatbotDto } from '../chatbots/dto/chat-with-chatbot.dto';
import { ResourcesService } from '../resources/resources.service';
import { CreateResourceDto } from '../resources/dto/create-resource.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { UploadService } from '../upload/upload.service';
import { extname } from 'path';
import { UploadMultiDto } from '../documents/dto/upload-multi.dto';
import { DocumentsService } from '../documents/documents.service';
import { GetDocumentDto } from '../documents/dto/get-document.dto';
import { ChatbotPromptService } from '../chatbot-prompt/chatbot-prompt.service';

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
  ) {}

  @Get('/profile/api-token')
  @ApiOperation({ summary: 'Create a API Token for user' })
  @ApiResponse({
    status: 201,
    description: 'The API Token has been successfully created.',
    type: User,
  })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  async createApiToken(
    @Req() request: Request & { user: { [key: string]: string } },
  ) {
    const token = await this.usersService.getApiTokenForUser(request.user.id);
    if (!token) {
      throw new BadRequestException('Cannot create API Token');
    }
    return {
      success: true,
      message: 'The API Token has been successfully created.',
      token,
    };
  }

  @Post('/:id/chatbots')
  @ApiOperation({ summary: 'Create a chatbot' })
  @ApiResponse({
    status: 201,
    description: 'The Chatbot has been successfully created.',
    type: User,
  })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  async createChatbotByUser(
    @Req() request: Request & { user: { [key: string]: string } },
    @Param('id') id: string,
    @Body(new ValidationPipe()) createChatbotDto: CreateChatbotDto,
  ) {
    if (request.user.id != id) {
      throw new UnauthorizedException('Unauthorized');
    }
    const newChatbot = await this.chatbotService.createChatbotByUser(
      request.user.id,
      createChatbotDto,
    );
    if (!newChatbot) {
      throw new BadRequestException('Cannot create Chatbot');
    }
    return {
      success: true,
      message: 'The Chatbot has been successfully created.',
      newChatbot,
    };
  }

  @Patch('/:userId/chatbots/:chatbotId')
  @ApiOperation({ summary: 'Update a chatbot' })
  @ApiResponse({
    status: 201,
    description: 'The Chatbot has been successfully updated.',
    type: User,
  })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  async updateChatbotByUser(
    @Req() request: Request & { user: { [key: string]: string } },
    @Param('userId') id: string,
    @Param('chatbotId') chatbotId: string,
    @Body(new ValidationPipe()) updateChatbotDto: UpdateChatbotDto,
  ) {
    if (request.user.id != id) {
      throw new UnauthorizedException('Unauthorized');
    }
    const updatedChatbot = await this.chatbotService.updateChatbotByUser(
      id,
      chatbotId,
      updateChatbotDto,
    );
    if (!updatedChatbot) {
      throw new BadRequestException('Cannot update Chatbot');
    }
    return {
      success: true,
      message: 'The Chatbot has been successfully updated',
      updatedChatbot,
    };
  }

  @Patch('/:userId/chatbots/:chatbotId/prompts')
  @ApiOperation({ summary: 'Update a prompt for chatbot' })
  @ApiResponse({
    status: 201,
    description: 'The prompt chatbot has been successfully updated.',
    type: User,
  })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  async updatePromptChatbotByUser(
    @Req() request: Request & { user: { [key: string]: string } },
    @Param('userId') id: string,
    @Param('chatbotId') chatbotId: string,
    @Body(new ValidationPipe()) updateChatbotDto: UpdateChatbotDto,
  ) {
    if (request.user.id != id) {
      throw new UnauthorizedException('Unauthorized');
    }
    const updatedChatbot = await this.chatbotService.updatePromptChatbot(
      chatbotId,
      updateChatbotDto,
    );
    if (!updatedChatbot) {
      throw new BadRequestException('Cannot update prompt chatbot');
    }
    return {
      success: true,
      message: 'The prompt chatbot has been successfully updated',
      updatedChatbot,
    };
  }

  @Post('/:userId/chatbots/:chatbotId/publish')
  @ApiOperation({ summary: 'Publish a chatbot' })
  @ApiResponse({
    status: 201,
    description: 'The Chatbot has been successfully published.',
    type: User,
  })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  async publishChatbotByUser(
    @Req() request: Request & { user: { [key: string]: string } },
    @Param('userId') id: string,
    @Param('chatbotId') chatbotId: string,
    @Body(new ValidationPipe()) publishChatbotDto: PublishChatbotDto,
  ) {
    if (request.user.id != id) {
      throw new UnauthorizedException('Unauthorized');
    }
    const publishedChatbot = await this.chatbotService.publishChatbotByUser(
      chatbotId,
      publishChatbotDto,
    );
    if (!publishedChatbot) {
      return {
        success: false,
        message: `Cannot publish chatbot id: ${chatbotId}`,
      };
    }
    return {
      success: true,
      message: 'The Chatbot has been successfully published.',
      publishedChatbot,
    };
  }

  @Post(':userId/chatbots/:chatbotId/chat')
  async chatWithBot(
    @Param('chatbotId') chatbotId: string,
    @Param('userId') userId: string,
    @Req() request: Request & { user: { [key: string]: string } },
    @Body() chatWithChatbotDto: ChatWithChatbotDto,
  ) {
    if (userId != request.user.id) {
      throw new UnauthorizedException('Unauthorized');
    }
    return await this.chatbotService.chatWithBot(
      request.user.external_user_id,
      chatbotId,
      chatWithChatbotDto,
    );
  }

  @Post('/:userId/resources')
  @ApiOperation({ summary: 'Create resource' })
  @ApiResponse({
    status: 201,
    description: 'Resource has been successfully created.',
  })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  async createResource(
    @Req() request: Request & { user: { [key: string]: string } },
    @Param('userId') id: string,
    @Body(new ValidationPipe()) createResourceDto: CreateResourceDto,
  ) {
    if (request.user.id != id) {
      throw new UnauthorizedException('Unauthorized');
    }
    const createdResource = await this.resourceService.createResourceForUser(
      id,
      createResourceDto,
    );
    if (!createdResource) {
      return {
        success: false,
        message: 'Cannot create resource',
      };
    }
    return {
      success: true,
      message: 'Resource has been successfully created.',
      createdResource,
    };
  }

  @Post('/:userId/resources/:resourceId/documents/files')
  @ApiOperation({ summary: 'Create resource' })
  @ApiResponse({
    status: 201,
    description: 'Resource has been successfully get.',
  })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  async getListDocument(
    @Req() request: Request & { user: { [key: string]: string } },
    @Param('userId') id: string,
    @Param('resourceId') resourceId: string,
    @Body(new ValidationPipe()) getDocumentDto: GetDocumentDto,
  ) {
    if (request.user.id != id) {
      throw new UnauthorizedException('Unauthorized');
    }
    const listDocument = await this.documentService.getListDocumentForUser(
      resourceId,
      getDocumentDto,
    );
    if (!listDocument) {
      return {
        success: false,
        message: 'Cannot create resource',
      };
    }
    return {
      success: true,
      message: 'Resource has been successfully created.',
      listDocument,
    };
  }

  @Post('/:userId/resources/:resourceId/prompts')
  @ApiOperation({ summary: 'Create prompts' })
  @ApiResponse({
    status: 201,
    description: 'prompts has been successfully get.',
  })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  async submitPromptToResource(
    @Req() request: Request & { user: { [key: string]: string } },
    @Param('userId') id: string,
    @Param('resourceId') resourceId: string,
    @Body(new ValidationPipe()) updateChatbotDto: UpdateChatbotDto,
  ) {
    if (request.user.id != id) {
      throw new UnauthorizedException('Unauthorized');
    }
    if (!updateChatbotDto.prompt_name || !updateChatbotDto.prompt_info) {
      throw new BadRequestException('Must have name and prompt info');
    }
    const prompt =
      await this.chatbotPromptService.submitPromptChatbotToResource(
        resourceId,
        updateChatbotDto,
      );
    if (!prompt) {
      throw new BadRequestException('Cannot create prompt');
    }
    return {
      success: true,
      message: 'prompts has been successfully created.',
      prompt,
    };
  }

  @Post('/:userId/resources/:resourceId/documents/images')
  @ApiOperation({ summary: 'Create resource' })
  @ApiResponse({
    status: 201,
    description: 'Resource has been successfully get.',
  })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  async getListImagesUploaded(
    @Req() request: Request & { user: { [key: string]: string } },
    @Param('userId') id: string,
    @Param('resourceId') resourceId: string,
    @Body(new ValidationPipe()) getDocumentDto: GetDocumentDto,
  ) {
    if (request.user.id != id) {
      throw new UnauthorizedException('Unauthorized');
    }
    const listDocument = await this.documentService.getListDocumentForUser(
      resourceId,
      getDocumentDto,
    );
    if (!listDocument) {
      return {
        success: false,
        message: 'Cannot create resource',
      };
    }
    return {
      success: true,
      message: 'Resource has been successfully created.',
      listDocument,
    };
  }

  @Post('/:id/endcode-files')
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: 10 * 1024 * 1024 },
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

    const base64 = file.buffer.toString('base64');
    return {
      filename: file.originalname,
      mimetype: file.mimetype,
      base64,
    };
  }

  @Post('/:userId/resources/:resourceId/documents')
  @ApiOperation({ summary: 'Create documents' })
  @ApiResponse({
    status: 201,
    description: 'Documents has been successfully created.',
  })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  async uploadFileLocalToResource(
    @Req() request: Request & { user: { [key: string]: string } },
    @Param('userId') id: string,
    @Param('resourceId') resourceId: string,
    @Body(new ValidationPipe())
    uploadMultiDto: UploadMultiDto,
  ) {
    if (request.user.id != id) {
      throw new UnauthorizedException('Unauthorized');
    }
    if (uploadMultiDto.file_type) {
      const uploadedResource = await this.resourceService.uploadDocument(
        resourceId,
        uploadMultiDto,
      );
      if (!uploadedResource) {
        return {
          success: false,
          message: 'Cannot upload file to resource',
        };
      }
      return {
        success: true,
        message: 'Upload success.',
        uploadedResource,
      };
    }

    if (uploadMultiDto.document_source) {
      const uploadedResource = await this.resourceService.uploadImageDocument(
        resourceId,
        uploadMultiDto,
      );
      if (!uploadedResource) {
        return {
          success: false,
          message: 'Cannot upload file to resource',
        };
      }
      return {
        success: true,
        message: 'Upload success.',
        uploadedResource,
      };
    }
  }

  @Post()
  @ApiOperation({ summary: 'Create a new user' })
  @ApiResponse({
    status: 201,
    description: 'The user has been successfully created.',
    type: User,
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
  @ApiOperation({ summary: 'Get user info' })
  @ApiResponse({ status: 200, description: 'User found', type: User })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getInfoUser(
    @Req() request: Request & { user: { [key: string]: string } },
  ) {
    const user = await this.usersService.findOne(request.user.id);
    return {
      success: true,
      message: 'Get user info successfully',
      user,
    };
  }

  @Get('/profile/workspaces')
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Get workspaces info' })
  @ApiResponse({ status: 200, description: 'Workspaces found', type: User })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async findAllWorkspacesForUser(
    @Req() request: Request & { user: { [key: string]: string } },
  ) {
    const workspaces = await this.workspaceService.findWorkspaceByUserId(
      request.user.id,
    );
    return {
      success: true,
      message: 'Get workspaces successfully',
      workspaces,
    };
  }

  @Get('/profile/resources')
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Get resources info' })
  @ApiResponse({ status: 200, description: 'Resources found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async findAllResourceForUser(
    @Req() request: Request & { user: { [key: string]: string } },
  ) {
    const resources = await this.resourceService.findAllResourceForUser(
      request.user.id,
    );
    return {
      success: true,
      message: 'Get resources successfully',
      resources,
    };
  }

  @Get('/profile/resources/:resourceId')
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Get resources info' })
  @ApiResponse({ status: 200, description: 'Resources found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async findOneResourceForUser(
    @Param('resourceId') resourceId: string,
    @Req()
    request: Request & { user: { [key: string]: string } },
  ) {
    const resource = await this.resourceService.findOneResourceForUser(
      request.user.id,
      resourceId,
    );
    return {
      success: true,
      message: 'Get resources successfully',
      resource,
    };
  }

  @Get('/profile/chatbots')
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Get list chatbots info' })
  @ApiResponse({ status: 200, description: 'List Chatbots', type: User })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async findAllChatbotsForUser(
    @Req() request: Request & { user: { [key: string]: string } },
  ) {
    const chatbots = await this.chatbotService.findAllChatbotsForUser(
      request.user.id,
    );
    return {
      success: true,
      message: 'Get chatbots successfully',
      chatbots,
    };
  }

  @Get('/profile/chatbots/:chatbotId')
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Get a chatbot info' })
  @ApiResponse({ status: 200, description: 'Infomation Chatbots', type: User })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async findChatbotForUser(
    @Param('chatbotId') chatbotId: string,
    @Req() request: Request & { user: { [key: string]: string } },
  ) {
    const chatbots = await this.chatbotService.findChatbotForUser(
      request.user.id,
      chatbotId,
    );
    return {
      success: true,
      message: 'Get chatbot successfully',
      chatbots,
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
    type: User,
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
