import { Test, TestingModule } from '@nestjs/testing';
import { OnboardingSuggestedQuestionsService } from './onboarding-suggested-questions.service';

describe('OnboardingSuggestedQuestionsService', () => {
  let service: OnboardingSuggestedQuestionsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [OnboardingSuggestedQuestionsService],
    }).compile();

    service = module.get<OnboardingSuggestedQuestionsService>(OnboardingSuggestedQuestionsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
