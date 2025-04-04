import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ChatbotKnowledgeService } from './chatbot-knowledge.service';
import { CreateChatbotKnowledgeDto } from './dto/create-chatbot-knowledge.dto';
import { UpdateChatbotKnowledgeDto } from './dto/update-chatbot-knowledge.dto';

@Controller('chatbot-knowledge')
export class ChatbotKnowledgeController {
  constructor(private readonly chatbotKnowledgeService: ChatbotKnowledgeService) {}

  @Post()
  create(@Body() createChatbotKnowledgeDto: CreateChatbotKnowledgeDto) {
    return this.chatbotKnowledgeService.create(createChatbotKnowledgeDto);
  }

  @Get()
  findAll() {
    return this.chatbotKnowledgeService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.chatbotKnowledgeService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateChatbotKnowledgeDto: UpdateChatbotKnowledgeDto) {
    return this.chatbotKnowledgeService.update(+id, updateChatbotKnowledgeDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.chatbotKnowledgeService.remove(+id);
  }
}
