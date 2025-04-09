import { Injectable } from '@nestjs/common';
import { CreateChatbotPromptDto } from './dto/create-chatbot-prompt.dto';
import { UpdateChatbotPromptDto } from './dto/update-chatbot-prompt.dto';

@Injectable()
export class ChatbotPromptService {
  create(createChatbotPromptDto: CreateChatbotPromptDto) {
    return 'This action adds a new chatbotPrompt';
  }

  createPromptForUser(createChatbotPromptDto: CreateChatbotPromptDto) {
    return 'This action adds a new chatbotPrompt';
  }

  findAll() {
    return `This action returns all chatbotPrompt`;
  }

  findOne(id: number) {
    return `This action returns a #${id} chatbotPrompt`;
  }

  update(id: number, updateChatbotPromptDto: UpdateChatbotPromptDto) {
    return `This action updates a #${id} chatbotPrompt`;
  }

  remove(id: number) {
    return `This action removes a #${id} chatbotPrompt`;
  }
}
