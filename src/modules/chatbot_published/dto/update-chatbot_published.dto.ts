import { PartialType } from '@nestjs/swagger';
import { CreateChatbotPublishedDto } from './create-chatbot_published.dto';

export class UpdateChatbotPublishedDto extends PartialType(CreateChatbotPublishedDto) {}
