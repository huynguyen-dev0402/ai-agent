import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateChatbotModelDto } from '@modules/chatbot-models/dto/create-chatbot-model.dto';
import { UpdateChatbotModelDto } from '@modules/chatbot-models/dto/update-chatbot-model.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { ChatbotModel } from '@modules/chatbot-models/entities/chatbot-model.entity';
import { Repository } from 'typeorm';

@Injectable()
export class ChatbotModelsService {
  constructor(
    @InjectRepository(ChatbotModel)
    private readonly chatbotModelRepository: Repository<ChatbotModel>,
  ) {}

  async create(createChatbotModelDto: CreateChatbotModelDto): Promise<ChatbotModel> {
    const model = this.chatbotModelRepository.create(createChatbotModelDto);
    return await this.chatbotModelRepository.save(model);
  }

  async findAll(): Promise<ChatbotModel[] | false> {
    const models = await this.chatbotModelRepository.find({});
    if (!models.length) {
      return false;
    }
    return models;
  }

  async findOne(id: string): Promise<ChatbotModel | false> {
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

  async update(id: string, updateChatbotModelDto: UpdateChatbotModelDto): Promise<ChatbotModel> {
    const model = await this.chatbotModelRepository.findOne({
      where: { id },
    });

    if (!model) {
      throw new NotFoundException(`Chatbot model with ID ${id} not found`);
    }

    Object.assign(model, updateChatbotModelDto);
    return await this.chatbotModelRepository.save(model);
  }

  async remove(id: string): Promise<void> {
    const model = await this.chatbotModelRepository.findOne({
      where: { id },
    });

    if (!model) {
      throw new NotFoundException(`Chatbot model with ID ${id} not found`);
    }

    await this.chatbotModelRepository.remove(model);
  }
}
