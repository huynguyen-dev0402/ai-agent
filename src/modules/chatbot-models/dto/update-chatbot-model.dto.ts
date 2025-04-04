import { PartialType } from '@nestjs/swagger';
import { CreateChatbotModelDto } from './create-chatbot-model.dto';

export class UpdateChatbotModelDto extends PartialType(CreateChatbotModelDto) {}
