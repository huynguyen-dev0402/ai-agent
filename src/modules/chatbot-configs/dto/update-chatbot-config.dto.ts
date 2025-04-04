import { PartialType } from '@nestjs/swagger';
import { CreateChatbotConfigDto } from './create-chatbot-config.dto';

export class UpdateChatbotConfigDto extends PartialType(CreateChatbotConfigDto) {}
