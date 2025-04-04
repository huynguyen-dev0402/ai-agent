import { Module } from '@nestjs/common';
import { ChatbotsService } from './chatbots.service';
import { ChatbotsController } from './chatbots.controller';
import { Chatbot } from './entities/chatbot.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [TypeOrmModule.forFeature([Chatbot]), AuthModule, UsersModule],
  controllers: [ChatbotsController],
  providers: [ChatbotsService],
})
export class ChatbotsModule {}
