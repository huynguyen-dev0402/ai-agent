import {
  Controller,
  Post,
  Patch,
  Body,
  Param,
  UseGuards,
  Req,
  ValidationPipe,
  BadRequestException,
  Query,
} from '@nestjs/common';
import { ChatbotsService } from '../chatbots/chatbots.service';
import { CreateChatbotDto } from '../chatbots/dto/create-chatbot.dto';
import { UpdateChatbotDto } from '../chatbots/dto/update-chatbot.dto';
import { AuthGuard } from '../auth/guards/jwt-auth.guard';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { UserIdMatchGuard } from 'src/guards/user-id-match.guard';
import { ChatWithChatbotDto } from './dto/chat-with-chatbot.dto';

@Controller('users/:userId/chatbots')
@UseGuards(AuthGuard, UserIdMatchGuard)
@ApiTags('Chatbots')
@ApiBearerAuth('access-token')
export class ChatbotsController {
  constructor(private readonly chatbotsService: ChatbotsService) {}
  // @Post('/:chatbotId/chat')
  //   async chatWithBot(
  //     @Param('chatbotId') chatbotId: string,
  //     @Body() chatWithChatbotDto: ChatWithChatbotDto,
  //   ) {
  //     return await this.chatbotsService.chatWithBot(
  //       request.user.external_user_id,
  //       chatbotId,
  //       chatWithChatbotDto,
  //     );
  //   }
}
