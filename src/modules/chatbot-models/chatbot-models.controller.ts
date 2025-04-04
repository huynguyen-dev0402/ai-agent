import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ChatbotModelsService } from './chatbot-models.service';
import { CreateChatbotModelDto } from './dto/create-chatbot-model.dto';
import { UpdateChatbotModelDto } from './dto/update-chatbot-model.dto';

@Controller('chatbot-models')
export class ChatbotModelsController {
  constructor(private readonly chatbotModelsService: ChatbotModelsService) {}

  @Post()
  create(@Body() createChatbotModelDto: CreateChatbotModelDto) {
    return this.chatbotModelsService.create(createChatbotModelDto);
  }

  @Get()
  findAll() {
    return this.chatbotModelsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.chatbotModelsService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateChatbotModelDto: UpdateChatbotModelDto) {
    return this.chatbotModelsService.update(+id, updateChatbotModelDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.chatbotModelsService.remove(+id);
  }
}
