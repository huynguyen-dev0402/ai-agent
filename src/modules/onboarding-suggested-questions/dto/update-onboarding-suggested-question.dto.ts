import { PartialType } from '@nestjs/swagger';
import { CreateOnboardingSuggestedQuestionDto } from './create-onboarding-suggested-question.dto';

export class UpdateOnboardingSuggestedQuestionDto extends PartialType(CreateOnboardingSuggestedQuestionDto) {}
