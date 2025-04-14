import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ChatbotPromptService } from './chatbot-prompt.service';
import { CreateChatbotPromptDto } from './dto/create-chatbot-prompt.dto';
import { UpdateChatbotPromptDto } from './dto/update-chatbot-prompt.dto';

@Controller('chatbot-prompt')
export class ChatbotPromptController {
  constructor(private readonly chatbotPromptService: ChatbotPromptService) {}

  @Post()
  create(@Body() createChatbotPromptDto: CreateChatbotPromptDto) {
    return this.chatbotPromptService.create(createChatbotPromptDto);
  }

  @Get()
  findAll() {
    return this.chatbotPromptService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.chatbotPromptService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateChatbotPromptDto: UpdateChatbotPromptDto) {
    return this.chatbotPromptService.update(+id, updateChatbotPromptDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.chatbotPromptService.remove(+id);
  }
}
