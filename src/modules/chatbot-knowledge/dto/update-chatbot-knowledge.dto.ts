import { PartialType } from '@nestjs/swagger';
import { CreateChatbotKnowledgeDto } from './create-chatbot-knowledge.dto';

export class UpdateChatbotKnowledgeDto extends PartialType(CreateChatbotKnowledgeDto) {}
