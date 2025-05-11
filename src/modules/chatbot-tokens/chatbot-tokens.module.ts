import { Module } from '@nestjs/common';
import { ChatbotTokensService } from '@modules/chatbot-tokens/chatbot-tokens.service';
import { ChatbotTokensController } from '@modules/chatbot-tokens/chatbot-tokens.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatbotToken } from '@modules/chatbot-tokens/entities/chatbot-token.entity';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    TypeOrmModule.forFeature([ChatbotToken]),
    JwtModule.register({
      secret: process.env.JWT_SECRET,
    }),
  ],
  controllers: [ChatbotTokensController],
  providers: [ChatbotTokensService],
  exports: [ChatbotTokensService],
})
export class ChatbotTokensModule {}
