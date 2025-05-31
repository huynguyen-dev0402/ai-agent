import { Module } from '@nestjs/common';
import { WorkspaceMembersService } from './workspace-members.service';
import { WorkspaceMembersController } from './workspace-members.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WorkspaceMember } from './entities/workspace-member.entity';
//import { AdminGuard } from '@common/guards/workspace-admin.guard';
import { UserSubscriptions } from '@modules/user-subscriptions/entities/user-subscriptions.entity';
import { User } from '@modules/users/entities/user.entity';
import { Workspace } from '@modules/workspaces/entities/workspace.entity';
import { Subscription } from 'rxjs';
import { CheckQuotaInterceptor } from '@common/interceptors/usage-logs.interceptor';
import { QuotaService } from '@modules/quota/quota.service';
import { Reflector } from '@nestjs/core';
import { UsageLog } from '@modules/usage-logs/entities/usage-log.entity';
import { UserSubscriptionsService } from '@modules/user-subscriptions/user-subscriptions.service';
import { UsersService } from '@modules/users/users.service';
import { ApiToken } from '@modules/api-tokens/entities/api-token.entity';
import { UsageLogsService } from '@modules/usage-logs/usage-logs.service';
import { UsersModule } from '@modules/users/users.module';
import { AuthModule } from '@modules/auth/auth.module';
import { ChatbotModelsModule } from '@modules/chatbot-models/chatbot-models.module';
import { MessagesModule } from '@modules/messages/messages.module';
import { UsageLogsModule } from '@modules/usage-logs/usage-logs.module';
import { UserSubscriptionsModule } from '@modules/user-subscriptions/user-subscriptions.module';
import { WorkspacesModule } from '@modules/workspaces/workspaces.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([WorkspaceMember, Workspace, User]),
    WorkspacesModule,
    UsersModule,
    UserSubscriptionsModule,
    UsageLogsModule,
    AuthModule,
  ],
  controllers: [WorkspaceMembersController],
  providers: [
    WorkspaceMembersService,
    //AdminGuard,
    CheckQuotaInterceptor,
    Reflector,
    QuotaService,
  ],
  exports: [WorkspaceMembersService],
})
export class WorkspaceMembersModule {}
