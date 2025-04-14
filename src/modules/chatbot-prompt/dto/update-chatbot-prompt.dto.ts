import { PartialType } from '@nestjs/swagger';
import { CreateChatbotPromptDto } from './create-chatbot-prompt.dto';

export class UpdateChatbotPromptDto extends PartialType(CreateChatbotPromptDto) {}
