import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ChatbotConfigsService } from './chatbot-configs.service';
import { CreateChatbotConfigDto } from './dto/create-chatbot-config.dto';
import { UpdateChatbotConfigDto } from './dto/update-chatbot-config.dto';

@Controller('chatbot-configs')
export class ChatbotConfigsController {
  constructor(private readonly chatbotConfigsService: ChatbotConfigsService) {}

  @Post()
  create(@Body() createChatbotConfigDto: CreateChatbotConfigDto) {
    return this.chatbotConfigsService.create(createChatbotConfigDto);
  }

  @Get()
  findAll() {
    return this.chatbotConfigsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.chatbotConfigsService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateChatbotConfigDto: UpdateChatbotConfigDto) {
    return this.chatbotConfigsService.update(+id, updateChatbotConfigDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.chatbotConfigsService.remove(+id);
  }
}
