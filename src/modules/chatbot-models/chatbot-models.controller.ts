import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  NotFoundException,
} from '@nestjs/common';
import { ChatbotModelsService } from '@modules/chatbot-models/chatbot-models.service';
import { CreateChatbotModelDto } from '@modules/chatbot-models/dto/create-chatbot-model.dto';
import { UpdateChatbotModelDto } from '@modules/chatbot-models/dto/update-chatbot-model.dto';

@Controller('chatbot-models')
export class ChatbotModelsController {
  constructor(private readonly chatbotModelsService: ChatbotModelsService) {}

  @Post()
  create(@Body() createChatbotModelDto: CreateChatbotModelDto) {
    return this.chatbotModelsService.create(createChatbotModelDto);
  }

  @Get()
  async findAll() {
    const models = await this.chatbotModelsService.findAll();
    if (!models) {
      throw new NotFoundException('Models not found');
    }
    return models;
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.chatbotModelsService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateChatbotModelDto: UpdateChatbotModelDto,
  ) {
    return this.chatbotModelsService.update(+id, updateChatbotModelDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.chatbotModelsService.remove(+id);
  }
}
