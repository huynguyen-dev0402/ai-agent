import { Module } from '@nestjs/common';
import { DocumentsService } from '@modules/documents/documents.service';
import { DocumentsController } from '@modules/documents/documents.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Document } from '@modules/documents/entities/document.entity';
import { Resource } from '@modules/resources/entities/resource.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Document, Resource])],
  controllers: [DocumentsController],
  providers: [DocumentsService],
  exports: [DocumentsService],
})
export class DocumentsModule {}
