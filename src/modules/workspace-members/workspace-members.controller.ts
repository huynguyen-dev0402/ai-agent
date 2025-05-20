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
} from '@nestjs/common';
import { WorkspaceMembersService } from './workspace-members.service';
import { AdminGuard } from '@common/guards/workspace-admin.guard';
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

@Controller('workspaces/:workspaceId/members')
export class WorkspaceMembersController {
  constructor(
    private readonly workspaceMembersService: WorkspaceMembersService,
  ) {}

  @Get()
  async getMembers(
    @Param('workspaceId') workspaceId: string,
    @Query('userId') userId: string,
  ) {
    const members = await this.workspaceMembersService.findAllMember(
      workspaceId,
      userId,
    );
    return {
      success: true,
      message: 'Get members success',
      data: members,
    };
  }

  @Post()
  @UseGuards(AdminGuard)
  @UseInterceptors(CheckQuotaInterceptor) // Áp dụng interceptor để ghi log usage
  @CheckQuota({
    resourceType: ResourceType.MEMBER,
    action: UsageAction.CREATE,
    quantity: QUANTITY_REDUCE, // Số lượng sử dụng, mặc định là 1
  })
  async addMember(
    @Param('workspaceId') workspaceId: string,
    @Body() addMemberDto: AddMemberDto,
    @Req() request: Request & { user: { [key: string]: string } },
  ) {
    await this.workspaceMembersService.addMember(
      request.user.id,
      workspaceId,
      addMemberDto,
    );
    return {
      success: true,
      message: 'Add member success',
    };
  }

  @Patch('')
  @UseGuards(AdminGuard)
  async updateMemberRole(
    @Param('workspaceId') workspaceId: string,
    @Body() editMemberDto: EditMemberDto,
    @Req() request: Request & { user: { [key: string]: string } },
  ) {
    const member = await this.workspaceMembersService.updateMemberRole(
      workspaceId,
      request.user.id,
      editMemberDto,
    );
    return {
      success: true,
      message: 'Update role success',
      data: member,
    };
  }

  @Delete('/:userId')
  @UseGuards(AdminGuard)
  async removeMember(
    @Param('workspaceId') workspaceId: string,
    @Param('userId') userId: string,
    @Req() request: Request & { user: { [key: string]: string } },
  ) {
    const result = await this.workspaceMembersService.removeMember(
      workspaceId,
      userId,
      request.user.id,
    );
    return { success: true, message: result.message };
  }
}
