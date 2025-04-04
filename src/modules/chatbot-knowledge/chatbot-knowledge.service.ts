import { Injectable } from '@nestjs/common';
import { CreateChatbotKnowledgeDto } from './dto/create-chatbot-knowledge.dto';
import { UpdateChatbotKnowledgeDto } from './dto/update-chatbot-knowledge.dto';

@Injectable()
export class ChatbotKnowledgeService {
  create(createChatbotKnowledgeDto: CreateChatbotKnowledgeDto) {
    return 'This action adds a new chatbotKnowledge';
  }

  findAll() {
    return `This action returns all chatbotKnowledge`;
  }

  findOne(id: number) {
    return `This action returns a #${id} chatbotKnowledge`;
  }

  update(id: number, updateChatbotKnowledgeDto: UpdateChatbotKnowledgeDto) {
    return `This action updates a #${id} chatbotKnowledge`;
  }

  remove(id: number) {
    return `This action removes a #${id} chatbotKnowledge`;
  }
}
