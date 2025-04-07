import { Module } from '@nestjs/common';
import { ChatbotsService } from './chatbots.service';
import { ChatbotsController } from './chatbots.controller';
import { Chatbot } from './entities/chatbot.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { UsersModule } from '../users/users.module';
import { WorkspacesModule } from '../workspaces/workspaces.module';
import { ChatbotModelsModule } from '../chatbot-models/chatbot-models.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Chatbot]),
    AuthModule,
    WorkspacesModule,
    UsersModule,
    ChatbotModelsModule,
  ],
  controllers: [ChatbotsController],
  providers: [ChatbotsService],
  exports: [ChatbotsService],
})
export class ChatbotsModule {}
