import { Module } from '@nestjs/common';
import { WorkspacesService } from '@modules/workspaces/workspaces.service';
import { WorkspacesController } from '@modules/workspaces/workspaces.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Workspace } from '@modules/workspaces/entities/workspace.entity';
import { AuthModule } from '@modules/auth/auth.module';

@Module({
  imports: [TypeOrmModule.forFeature([Workspace]), AuthModule],
  controllers: [WorkspacesController],
  providers: [WorkspacesService],
  exports: [WorkspacesService],
})
export class WorkspacesModule {}
