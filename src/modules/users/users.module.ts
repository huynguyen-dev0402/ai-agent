import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { AuthModule } from '../auth/auth.module';
import { ApiTokensModule } from '../api-tokens/api-tokens.module';
import { WorkspacesModule } from '../workspaces/workspaces.module';
import { Workspace } from '../workspaces/entities/workspace.entity';
import { ApiToken } from '../api-tokens/entities/api-token.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Workspace, ApiToken]),
    AuthModule,
    ApiTokensModule,
    WorkspacesModule,
  ],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
