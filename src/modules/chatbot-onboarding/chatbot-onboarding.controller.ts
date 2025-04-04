import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ChatbotOnboardingService } from './chatbot-onboarding.service';
import { CreateChatbotOnboardingDto } from './dto/create-chatbot-onboarding.dto';
import { UpdateChatbotOnboardingDto } from './dto/update-chatbot-onboarding.dto';

@Controller('chatbot-onboarding')
export class ChatbotOnboardingController {
  constructor(private readonly chatbotOnboardingService: ChatbotOnboardingService) {}

  @Post()
  create(@Body() createChatbotOnboardingDto: CreateChatbotOnboardingDto) {
    return this.chatbotOnboardingService.create(createChatbotOnboardingDto);
  }

  @Get()
  findAll() {
    return this.chatbotOnboardingService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.chatbotOnboardingService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateChatbotOnboardingDto: UpdateChatbotOnboardingDto) {
    return this.chatbotOnboardingService.update(+id, updateChatbotOnboardingDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.chatbotOnboardingService.remove(+id);
  }
}
