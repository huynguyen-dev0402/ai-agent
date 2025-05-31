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

@UseGuards(AuthGuard, UserIdMatchGuard)
@Controller('users/:userId/members')
export class WorkspaceMembersController {
  constructor(
    private readonly workspaceMembersService: WorkspaceMembersService,
  ) {}

  @Get()
  async getMembers(@Param('userId') userId: string) {
    const members = await this.workspaceMembersService.findAllMember(userId);
    return {
      success: true,
      message: 'Get members success',
      data: members,
    };
  }

  @Post()
  @UseInterceptors(CheckQuotaInterceptor) // Áp dụng interceptor để ghi log usage
  @CheckQuota({
    resourceType: ResourceType.MEMBER,
    action: UsageAction.CREATE,
    quantity: QUANTITY_REDUCE, // Số lượng sử dụng, mặc định là 1
  })
  async addMember(
    @Param('userId') userId: string,
    @Body() addMemberDto: AddMemberDto,
  ) {
    await this.workspaceMembersService.addSubMember(userId, addMemberDto);
    return {
      success: true,
      message: 'Add member success',
    };
  }

  @Patch('')
  async updateMemberRole(
    @Param('userId') userId: string,
    @Body() editMemberDto: EditMemberDto,
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
