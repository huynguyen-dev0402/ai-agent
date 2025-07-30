import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  NotFoundException,
  HttpCode,
  ValidationPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';
import { ChatbotModelsService } from '@modules/chatbot-models/chatbot-models.service';
import { CreateChatbotModelDto } from '@modules/chatbot-models/dto/create-chatbot-model.dto';
import { UpdateChatbotModelDto } from '@modules/chatbot-models/dto/update-chatbot-model.dto';
import { ChatbotModel } from '@modules/chatbot-models/entities/chatbot-model.entity';

@ApiTags('Chatbot Models')
@Controller('chatbot-models')
export class ChatbotModelsController {
  constructor(private readonly chatbotModelsService: ChatbotModelsService) {}

  @Post()
  @HttpCode(201)
  @ApiOperation({ summary: 'Create a new chatbot model' })
  @ApiBody({ type: CreateChatbotModelDto })
  @ApiResponse({
    status: 201,
    description: 'The chatbot model has been successfully created.',
    type: ChatbotModel,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Invalid input data.',
  })
  create(@Body(new ValidationPipe()) createChatbotModelDto: CreateChatbotModelDto) {
    return this.chatbotModelsService.create(createChatbotModelDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all chatbot models' })
  @ApiResponse({
    status: 200,
    description: 'List of all chatbot models.',
    type: [ChatbotModel],
  })
  @ApiResponse({
    status: 404,
    description: 'No models found.',
  })
  async findAll() {
    const models = await this.chatbotModelsService.findAll();
    if (!models) {
      throw new NotFoundException('Models not found');
    }
    return models;
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a chatbot model by ID' })
  @ApiParam({
    name: 'id',
    description: 'UUID of the chatbot model',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'The chatbot model details.',
    type: ChatbotModel,
  })
  @ApiResponse({
    status: 404,
    description: 'Chatbot model not found.',
  })
  findOne(@Param('id') id: string) {
    return this.chatbotModelsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a chatbot model' })
  @ApiParam({
    name: 'id',
    description: 'UUID of the chatbot model',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiBody({ type: UpdateChatbotModelDto })
  @ApiResponse({
    status: 200,
    description: 'The chatbot model has been successfully updated.',
    type: ChatbotModel,
  })
  @ApiResponse({
    status: 404,
    description: 'Chatbot model not found.',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Invalid input data.',
  })
  update(
    @Param('id') id: string,
    @Body(new ValidationPipe()) updateChatbotModelDto: UpdateChatbotModelDto,
  ) {
    return this.chatbotModelsService.update(id, updateChatbotModelDto);
  }

  @Delete(':id')
  @HttpCode(204)
  @ApiOperation({ summary: 'Delete a chatbot model' })
  @ApiParam({
    name: 'id',
    description: 'UUID of the chatbot model',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 204,
    description: 'The chatbot model has been successfully deleted.',
  })
  @ApiResponse({
    status: 404,
    description: 'Chatbot model not found.',
  })
  remove(@Param('id') id: string) {
    return this.chatbotModelsService.remove(id);
  }
}
