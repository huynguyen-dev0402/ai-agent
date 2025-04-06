import { Injectable } from '@nestjs/common';
import { CreateChatbotPublishedDto } from './dto/create-chatbot_published.dto';
import { UpdateChatbotPublishedDto } from './dto/update-chatbot_published.dto';

@Injectable()
export class ChatbotPublishedService {
  create(createChatbotPublishedDto: CreateChatbotPublishedDto) {
    return 'This action adds a new chatbotPublished';
  }

  findAll() {
    return `This action returns all chatbotPublished`;
  }

  findOne(id: number) {
    return `This action returns a #${id} chatbotPublished`;
  }

  update(id: number, updateChatbotPublishedDto: UpdateChatbotPublishedDto) {
    return `This action updates a #${id} chatbotPublished`;
  }

  remove(id: number) {
    return `This action removes a #${id} chatbotPublished`;
  }
}
