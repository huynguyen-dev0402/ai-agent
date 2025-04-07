import { Injectable } from '@nestjs/common';
import { CreateChatbotModelDto } from './dto/create-chatbot-model.dto';
import { UpdateChatbotModelDto } from './dto/update-chatbot-model.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { ChatbotModel } from './entities/chatbot-model.entity';
import { Repository } from 'typeorm';

@Injectable()
export class ChatbotModelsService {
  constructor(
    @InjectRepository(ChatbotModel)
    private readonly chatbotModelRepository: Repository<ChatbotModel>,
  ) {}
  create(createChatbotModelDto: CreateChatbotModelDto) {
    return 'This action adds a new chatbotModel';
  }

  async findAll() {
    const models = await this.chatbotModelRepository.find({});
    if (!models.length) {
      return false;
    }
    return models;
  }

  async findOne(id: string) {
    const model = await this.chatbotModelRepository.findOne({
      where: {
        id,
      },
    });
    if (!model) {
      return false;
    }
    return model;
  }

  update(id: number, updateChatbotModelDto: UpdateChatbotModelDto) {
    return `This action updates a #${id} chatbotModel`;
  }

  remove(id: number) {
    return `This action removes a #${id} chatbotModel`;
  }
}
