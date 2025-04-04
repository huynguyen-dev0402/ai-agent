import { PartialType } from '@nestjs/swagger';
import { CreateChatbotOnboardingDto } from './create-chatbot-onboarding.dto';

export class UpdateChatbotOnboardingDto extends PartialType(CreateChatbotOnboardingDto) {}
