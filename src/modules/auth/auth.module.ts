import { Module } from '@nestjs/common';
import { AuthService } from '@modules/auth/auth.service';
import { AuthController } from '@modules/auth/auth.controller';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '@modules/users/entities/user.entity';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UsersService } from '@modules/users/users.service';
import { RedisModule } from '@nestjs-modules/ioredis';
import { Workspace } from '@modules/workspaces/entities/workspace.entity';
import { ApiToken } from '@modules/api-tokens/entities/api-token.entity';
import { ChatbotToken } from '@modules/chatbot-tokens/entities/chatbot-token.entity';
import { WorkspaceMember } from '@modules/workspace-members/entities/workspace-member.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: process.env.JWT_EXPIRED },
    }),
    TypeOrmModule.forFeature([User, Workspace, ApiToken, ChatbotToken, WorkspaceMember]),
    RedisModule.forRootAsync({
      useFactory: () => ({
        type: 'single',
        options: {
          host: process.env.REDIS_HOST,
          port: Number(process.env.REDIS_PORT),
          username: process.env.REDIS_USERNAME,
          password: process.env.REDIS_PASSWORD,
        },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, UsersService],
  exports: [AuthService],
})
export class AuthModule {}
