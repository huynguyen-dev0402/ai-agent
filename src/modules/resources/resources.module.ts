import { forwardRef, Module } from '@nestjs/common';
import { ResourcesService } from './resources.service';
import { ResourcesController } from './resources.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Resource } from './entities/resource.entity';
import { UsersModule } from '../users/users.module';
import { Document } from '../documents/entities/document.entity';
import { ChatbotResource } from '../chatbots/entities/chatbot-resources.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Resource, Document,ChatbotResource]),
    forwardRef(() => UsersModule),
  ],
  controllers: [ResourcesController],
  providers: [ResourcesService],
  exports: [ResourcesService],
})
export class ResourcesModule {}
