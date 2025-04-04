import { Test, TestingModule } from '@nestjs/testing';
import { OnboardingSuggestedQuestionsController } from './onboarding-suggested-questions.controller';
import { OnboardingSuggestedQuestionsService } from './onboarding-suggested-questions.service';

describe('OnboardingSuggestedQuestionsController', () => {
  let controller: OnboardingSuggestedQuestionsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OnboardingSuggestedQuestionsController],
      providers: [OnboardingSuggestedQuestionsService],
    }).compile();

    controller = module.get<OnboardingSuggestedQuestionsController>(OnboardingSuggestedQuestionsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
