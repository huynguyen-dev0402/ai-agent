import { Injectable } from '@nestjs/common';
import { CreateChatbotModelDto } from './dto/create-chatbot-model.dto';
import { UpdateChatbotModelDto } from './dto/update-chatbot-model.dto';

@Injectable()
export class ChatbotModelsService {
  create(createChatbotModelDto: CreateChatbotModelDto) {
    return 'This action adds a new chatbotModel';
  }

  findAll() {
    return `This action returns all chatbotModels`;
  }

  findOne(id: number) {
    return `This action returns a #${id} chatbotModel`;
  }

  update(id: number, updateChatbotModelDto: UpdateChatbotModelDto) {
    return `This action updates a #${id} chatbotModel`;
  }

  remove(id: number) {
    return `This action removes a #${id} chatbotModel`;
  }
}
