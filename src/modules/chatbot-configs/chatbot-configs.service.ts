import { Injectable } from '@nestjs/common';
import { CreateChatbotConfigDto } from './dto/create-chatbot-config.dto';
import { UpdateChatbotConfigDto } from './dto/update-chatbot-config.dto';

@Injectable()
export class ChatbotConfigsService {
  create(createChatbotConfigDto: CreateChatbotConfigDto) {
    return 'This action adds a new chatbotConfig';
  }

  findAll() {
    return `This action returns all chatbotConfigs`;
  }

  findOne(id: number) {
    return `This action returns a #${id} chatbotConfig`;
  }

  update(id: number, updateChatbotConfigDto: UpdateChatbotConfigDto) {
    return `This action updates a #${id} chatbotConfig`;
  }

  remove(id: number) {
    return `This action removes a #${id} chatbotConfig`;
  }
}
