import { Injectable } from '@nestjs/common';
import { CreateOnboardingSuggestedQuestionDto } from './dto/create-onboarding-suggested-question.dto';
import { UpdateOnboardingSuggestedQuestionDto } from './dto/update-onboarding-suggested-question.dto';

@Injectable()
export class OnboardingSuggestedQuestionsService {
  create(createOnboardingSuggestedQuestionDto: CreateOnboardingSuggestedQuestionDto) {
    return 'This action adds a new onboardingSuggestedQuestion';
  }

  findAll() {
    return `This action returns all onboardingSuggestedQuestions`;
  }

  findOne(id: number) {
    return `This action returns a #${id} onboardingSuggestedQuestion`;
  }

  update(id: number, updateOnboardingSuggestedQuestionDto: UpdateOnboardingSuggestedQuestionDto) {
    return `This action updates a #${id} onboardingSuggestedQuestion`;
  }

  remove(id: number) {
    return `This action removes a #${id} onboardingSuggestedQuestion`;
  }
}
