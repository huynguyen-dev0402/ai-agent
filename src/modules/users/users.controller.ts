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
import { request, Request } from 'express';
import { AuthService } from '../auth/auth.service';
import { ApiTokensService } from '../api-tokens/api-tokens.service';
import { WorkspacesService } from '../workspaces/workspaces.service';

@Controller('users')
@UseGuards(AuthGuard)
@ApiTags('Users')
@ApiBearerAuth('access-token')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly authService: AuthService,
    private readonly apiTokenService: ApiTokensService,
    private readonly workspaceService: WorkspacesService,
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
    return token;
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

  // @Get('/profile/api-tokens')
  // @ApiBearerAuth('access-token')
  // @ApiOperation({ summary: 'Get api key info' })
  // @ApiResponse({ status: 200, description: 'API key found', type: User })
  // @ApiResponse({ status: 401, description: 'Unauthorized' })
  // async getApiKeyForUser(
  //   @Req() request: Request & { user: { [key: string]: string } },
  // ) {
  //   const apiToken = await this.apiTokenService.findApiTokenByUserId(
  //     request.user.id,
  //   );
  //   if (!apiToken) {
  //     throw new NotFoundException('Api token not found');
  //   }
  //   return {
  //     success: true,
  //     message: 'Get api token successfully',
  //     apiToken,
  //   };
  // }

  // @Get('/profile/workspaces')
  // @ApiBearerAuth('access-token')
  // @ApiOperation({ summary: 'Get workspaces info' })
  // @ApiResponse({ status: 200, description: 'Workspaces found', type: User })
  // @ApiResponse({ status: 401, description: 'Unauthorized' })
  // async findAllWorkspacesForUser(
  //   @Req() request: Request & { user: { [key: string]: string } },
  // ) {
  //   const workspaces = await this.workspaceService.findAllWorkspacesByUserId(
  //     request.user.id,
  //   );
  //   if (!workspaces) {
  //     throw new NotFoundException('Workspaces not found');
  //   }
  //   return {
  //     success: true,
  //     message: 'Get workspaces successfully',
  //     workspaces,
  //   };
  // }

  // @Get('/profile/workspaces/chatbots')
  // @ApiBearerAuth('access-token')
  // @ApiOperation({ summary: 'Get list chatbots info' })
  // @ApiResponse({ status: 200, description: 'List Chatbots', type: User })
  // @ApiResponse({ status: 401, description: 'Unauthorized' })
  // async findAllChatbotsForUser(
  //   @Req() request: Request & { user: { [key: string]: string } },
  // ) {
  //   const workspaces = await this.workspaceService.findAllWorkspacesByUserId(
  //     request.user.id,
  //   );
  //   if (!workspaces) {
  //     throw new NotFoundException('Workspaces not found');
  //   }
  //   const ids = workspaces.map((workspace) => workspace.id);
  //   const data =
  //     await this.workspaceService.findAllChatbotsByMultiWorkspaces(ids);

  //   return {
  //     success: true,
  //     message: 'Get chatbots successfully',
  //     data,
  //   };
  // }

  // @Get('/profile/workspaces/:workspaceId/chatbots')
  // @ApiBearerAuth('access-token')
  // @ApiOperation({ summary: 'Get list chatbots info' })
  // @ApiResponse({ status: 200, description: 'List Chatbots', type: User })
  // @ApiResponse({ status: 401, description: 'Unauthorized' })
  // async findAllChatbotsForUserByWorkspace(
  //   @Req() request: Request & { user: { [key: string]: string } },
  //   @Param('workspaceId') workspaceId: string,
  // ) {
  //   const workspaces = await this.workspaceService.findWorkspaceByUserId(
  //     request.user.id,
  //     workspaceId,
  //   );
  //   if (!workspaces) {
  //     throw new NotFoundException('Workspaces not found');
  //   }
  //   const chatbots = await this.workspaceService.findAllChatbotsByWorkspace(
  //     workspaces.id,
  //   );

  //   return {
  //     success: true,
  //     message: 'Get chatbots successfully',
  //     chatbots,
  //   };
  // }

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
