import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ChatbotPublishedService } from './chatbot_published.service';
import { CreateChatbotPublishedDto } from './dto/create-chatbot_published.dto';
import { UpdateChatbotPublishedDto } from './dto/update-chatbot_published.dto';

@Controller('chatbot-published')
export class ChatbotPublishedController {
  constructor(private readonly chatbotPublishedService: ChatbotPublishedService) {}

  @Post()
  create(@Body() createChatbotPublishedDto: CreateChatbotPublishedDto) {
    return this.chatbotPublishedService.create(createChatbotPublishedDto);
  }

  @Get()
  findAll() {
    return this.chatbotPublishedService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.chatbotPublishedService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateChatbotPublishedDto: UpdateChatbotPublishedDto) {
    return this.chatbotPublishedService.update(+id, updateChatbotPublishedDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.chatbotPublishedService.remove(+id);
  }
}
