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

  @Post()
  async create(@Body(new ValidationPipe()) createChatbotDto: CreateChatbotDto) {
    const chatbot = await this.chatbotsService.create(createChatbotDto);
    if (!chatbot) {
      throw new NotFoundException('Workspace not found');
    }
    return {
      success: true,
      message: 'Create chatbot successfully',
      chatbot,
    };
  }

  @Post('/publish')
  async publish(
    @Query('externalBotId') externalBotId: string,
    @Body(new ValidationPipe()) publishChatbotDto: PublishChatbotDto,
  ) {
    if (!externalBotId) {
      throw new BadRequestException('Must have external bot id');
    }
    const response = await this.chatbotsService.publish(
      externalBotId,
      publishChatbotDto,
    );
    if (!response) {
      throw new BadRequestException('Something went wrong');
    }
    return {
      success: true,
      message: 'Published bot successfully',
      external_bot_id: response.data.bot_id,
    };
  }

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

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateChatbotDto: UpdateChatbotDto,
  ) {
    if (!id) {
      throw new BadRequestException('Must have chatbot id');
    }
    const chatbot = await this.chatbotsService.update(id, updateChatbotDto);
    if (!chatbot) {
      throw new NotFoundException('Workspace not found');
    }
    return {
      success: true,
      message: 'Updated chatbot successfully',
      chatbot,
    };
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.chatbotsService.remove(id);
  }
}
