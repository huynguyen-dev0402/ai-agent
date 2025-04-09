import { forwardRef, Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { AuthModule } from '../auth/auth.module';
import { ApiTokensModule } from '../api-tokens/api-tokens.module';
import { WorkspacesModule } from '../workspaces/workspaces.module';
import { Workspace } from '../workspaces/entities/workspace.entity';
import { ApiToken } from '../api-tokens/entities/api-token.entity';
import { Chatbot } from '../chatbots/entities/chatbot.entity';
import { ChatbotsService } from '../chatbots/chatbots.service';
import { ChatbotModelsModule } from '../chatbot-models/chatbot-models.module';
import { ResourcesModule } from '../resources/resources.module';
import { UploadModule } from '../upload/upload.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Workspace, ApiToken, Chatbot]),
    AuthModule,
    ApiTokensModule,
    WorkspacesModule,
    ChatbotModelsModule,
    UploadModule,
    forwardRef(() => ResourcesModule),
  ],
  controllers: [UsersController],
  providers: [UsersService, ChatbotsService],
  exports: [UsersService],
})
export class UsersModule {}
