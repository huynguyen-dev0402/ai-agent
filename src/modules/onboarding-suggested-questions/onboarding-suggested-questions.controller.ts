import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { OnboardingSuggestedQuestionsService } from './onboarding-suggested-questions.service';
import { CreateOnboardingSuggestedQuestionDto } from './dto/create-onboarding-suggested-question.dto';
import { UpdateOnboardingSuggestedQuestionDto } from './dto/update-onboarding-suggested-question.dto';

@Controller('onboarding-suggested-questions')
export class OnboardingSuggestedQuestionsController {
  constructor(private readonly onboardingSuggestedQuestionsService: OnboardingSuggestedQuestionsService) {}

  @Post()
  create(@Body() createOnboardingSuggestedQuestionDto: CreateOnboardingSuggestedQuestionDto) {
    return this.onboardingSuggestedQuestionsService.create(createOnboardingSuggestedQuestionDto);
  }

  @Get()
  findAll() {
    return this.onboardingSuggestedQuestionsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.onboardingSuggestedQuestionsService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateOnboardingSuggestedQuestionDto: UpdateOnboardingSuggestedQuestionDto) {
    return this.onboardingSuggestedQuestionsService.update(+id, updateOnboardingSuggestedQuestionDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.onboardingSuggestedQuestionsService.remove(+id);
  }
}
