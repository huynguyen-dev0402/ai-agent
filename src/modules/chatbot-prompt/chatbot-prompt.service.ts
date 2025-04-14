import { Injectable } from '@nestjs/common';
import { CreateChatbotPromptDto } from './dto/create-chatbot-prompt.dto';
import { UpdateChatbotPromptDto } from './dto/update-chatbot-prompt.dto';
import { UpdateChatbotDto } from '../chatbots/dto/update-chatbot.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Resource } from '../resources/entities/resource.entity';
import { Repository } from 'typeorm';
import { ChatbotPrompt } from './entities/chatbot-prompt.entity';
import { User } from '../users/entities/user.entity';
import { PromptInfoDto } from '../chatbots/dto/prompt.dto';

@Injectable()
export class ChatbotPromptService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(ChatbotPrompt)
    private readonly chatbotPromptRepository: Repository<ChatbotPrompt>,
  ) {}
  create(createChatbotPromptDto: CreateChatbotPromptDto) {
    return 'This action adds a new chatbotPrompt';
  }

  createPromptForUser(createChatbotPromptDto: CreateChatbotPromptDto) {
    return 'This action adds a new chatbotPrompt';
  }

  async createPromptChatbotForUser(
    userId: string,
    promptInfoDto: PromptInfoDto,
  ) {
    const user = await this.userRepository.findOne({
      where: {
        id: userId,
      },
    });
    if (!user) {
      return false;
    }
    const newPrompt = this.chatbotPromptRepository.create({
      ...promptInfoDto,
      user,
    });
    await this.chatbotPromptRepository.save(newPrompt);
    return newPrompt;
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
