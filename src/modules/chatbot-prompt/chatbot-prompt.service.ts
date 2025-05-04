import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '@modules/users/entities/user.entity';
import { PromptInfoDto } from '@modules/chatbots/dto/prompt.dto';
import { CreateChatbotPromptDto } from '@modules/chatbot-prompt/dto/create-chatbot-prompt.dto';
import { UpdateChatbotPromptDto } from '@modules/chatbot-prompt/dto/update-chatbot-prompt.dto';
import { ChatbotPrompt } from '@modules/chatbot-prompt/entities/chatbot-prompt.entity';

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
