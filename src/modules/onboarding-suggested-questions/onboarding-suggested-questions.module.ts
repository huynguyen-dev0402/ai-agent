import { Module } from '@nestjs/common';
import { OnboardingSuggestedQuestionsService } from './onboarding-suggested-questions.service';
import { OnboardingSuggestedQuestionsController } from './onboarding-suggested-questions.controller';

@Module({
  controllers: [OnboardingSuggestedQuestionsController],
  providers: [OnboardingSuggestedQuestionsService],
})
export class OnboardingSuggestedQuestionsModule {}
