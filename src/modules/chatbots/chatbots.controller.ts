import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ValidationPipe,
  UseGuards,
  Req,
  NotFoundException,
  BadRequestException,
  Query,
} from '@nestjs/common';
import { ChatbotsService } from './chatbots.service';
import { CreateChatbotDto } from './dto/create-chatbot.dto';
import { UpdateChatbotDto } from './dto/update-chatbot.dto';
import { AuthGuard } from '../auth/guards/jwt-auth.guard';
import { PublishChatbotDto } from './dto/publish-chatbot.dto';

@UseGuards(AuthGuard)
@Controller('chatbots')
export class ChatbotsController {
  constructor(private readonly chatbotsService: ChatbotsService) {}
  // @Get()
  // async findAll() {
  //   const chatbot = await this.chatbotsService.findAll();
  //   if (!chatbot) {
  //     throw new NotFoundException('Chatbot not found');
  //   }
  //   return chatbot;
  // }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const chatbot = await this.chatbotsService.findOne(id);
    if (!chatbot) {
      throw new NotFoundException('Chatbot not found');
    }
    return chatbot;
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.chatbotsService.remove(id);
  }
}
