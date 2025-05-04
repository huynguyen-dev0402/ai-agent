import { forwardRef, Module } from '@nestjs/common';
import { ResourcesService } from '@modules/resources/resources.service';
import { ResourcesController } from '@modules/resources/resources.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Resource } from '@modules/resources/entities/resource.entity';
import { UsersModule } from '@modules/users/users.module';
import { Document } from '@modules/documents/entities/document.entity';
import { ChatbotResource } from '@modules/chatbots/entities/chatbot-resources.entity';
import { User } from '@modules/users/entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Resource, Document, ChatbotResource, User]),
    forwardRef(() => UsersModule),
  ],
  controllers: [ResourcesController],
  providers: [ResourcesService],
  exports: [ResourcesService],
})
export class ResourcesModule {}
