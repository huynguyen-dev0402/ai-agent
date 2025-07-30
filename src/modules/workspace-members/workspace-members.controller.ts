import {
  Controller,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
  HttpStatus,
  BadRequestException,
  UseInterceptors,
  Req,
  Get,
  Query,
  HttpCode,
  ValidationPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { WorkspaceMembersService } from './workspace-members.service';
//import { AdminGuard } from '@common/guards/workspace-admin.guard';
import { AuthGuard } from '@modules/auth/guards/jwt-auth.guard';
import { CheckQuota } from '@common/decorators/check-quota.decorator';
import { CheckQuotaInterceptor } from '@common/interceptors/usage-logs.interceptor';
import {
  ResourceType,
  UsageAction,
} from '@modules/usage-logs/entities/usage-log.entity';
import { QUANTITY_REDUCE } from '@common/constants/quantity.constant';
import { AddMemberDto } from './dto/add-member.dto';
import { Request } from 'express';
import { EditMemberDto } from './dto/edit-member.dto';
import { UserIdMatchGuard } from '@common/guards/user-id-match.guard';
import { WorkspaceMember } from './entities/workspace-member.entity';

@ApiTags('Workspace Members')
@ApiBearerAuth()
@UseGuards(AuthGuard, UserIdMatchGuard)
@Controller('users/:userId/members')
export class WorkspaceMembersController {
  constructor(
    private readonly workspaceMembersService: WorkspaceMembersService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get all workspace members for a user' })
  @ApiParam({
    name: 'userId',
    description: 'UUID of the user',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved workspace members.',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: 'Get members success' },
        data: {
          type: 'array',
          items: { $ref: '#/components/schemas/WorkspaceMember' },
        },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing authentication token.',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - User ID does not match authenticated user.',
  })
  async getMembers(@Param('userId') userId: string) {
    const members = await this.workspaceMembersService.findAllMember(userId);
    return {
      success: true,
      message: 'Get members success',
      data: members,
    };
  }

  @Post()
  @HttpCode(201)
  @UseInterceptors(CheckQuotaInterceptor) // Áp dụng interceptor để ghi log usage
  @CheckQuota({
    resourceType: ResourceType.MEMBER,
    action: UsageAction.CREATE,
    quantity: QUANTITY_REDUCE, // Số lượng sử dụng, mặc định là 1
  })
  @ApiOperation({ summary: 'Add a new member to the workspace' })
  @ApiParam({
    name: 'userId',
    description: 'UUID of the user adding the member',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiBody({ type: AddMemberDto })
  @ApiResponse({
    status: 201,
    description: 'Member has been successfully added.',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: 'Add member success' },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Invalid input data or quota exceeded.',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing authentication token.',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - User ID does not match authenticated user or insufficient permissions.',
  })
  async addMember(
    @Param('userId') userId: string,
    @Body(new ValidationPipe()) addMemberDto: AddMemberDto,
  ) {
    await this.workspaceMembersService.addSubMember(userId, addMemberDto);
    return {
      success: true,
      message: 'Add member success',
    };
  }

  @Patch('')
  @ApiOperation({ summary: 'Update member role in workspace' })
  @ApiParam({
    name: 'userId',
    description: 'UUID of the user updating the member role',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiBody({ type: EditMemberDto })
  @ApiResponse({
    status: 200,
    description: 'Member role has been successfully updated.',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: 'Update role success' },
        data: { $ref: '#/components/schemas/WorkspaceMember' },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Invalid input data.',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing authentication token.',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - User ID does not match authenticated user or insufficient permissions.',
  })
  @ApiResponse({
    status: 404,
    description: 'Member not found.',
  })
  async updateMemberRole(
    @Param('userId') userId: string,
    @Body(new ValidationPipe()) editMemberDto: EditMemberDto,
    @Req() request: Request & { user: { [key: string]: string } },
  ) {
    const member = await this.workspaceMembersService.updateMemberRole(
      userId,
      request.user.id,
      editMemberDto,
    );
    return {
      success: true,
      message: 'Update role success',
      data: member,
    };
  }

  @Delete('/:memberId')
  @HttpCode(200)
  @ApiOperation({ summary: 'Remove a member from the workspace' })
  @ApiParam({
    name: 'userId',
    description: 'UUID of the user removing the member',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiParam({
    name: 'memberId',
    description: 'UUID of the member to be removed',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Member has been successfully removed.',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: 'Member removed successfully' },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing authentication token.',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - User ID does not match authenticated user or insufficient permissions.',
  })
  @ApiResponse({
    status: 404,
    description: 'Member not found.',
  })
  async removeMember(
    @Param('userId') userId: string,
    @Param('memberId') memberId: string,
  ) {
    const result = await this.workspaceMembersService.removeMember(
      memberId,
      userId,
    );
    return { success: true, message: result.message };
  }
}
