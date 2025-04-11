import { IsString, IsArray, IsNotEmpty, ValidateNested } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { CreateOnboardingSuggestedQuestionDto } from 'src/modules/onboarding-suggested-questions/dto/create-onboarding-suggested-question.dto';
export class CreateChatbotOnboardingDto {
  @IsNotEmpty({ message: 'Api token required' })
  api_token: string;

  @IsString()
  @ApiProperty({ example: 'Welcome to the chatbot!' })
  @IsNotEmpty({ message: 'Must have prologue' })
  prologue: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateOnboardingSuggestedQuestionDto)
  @ApiProperty({
    type: [CreateOnboardingSuggestedQuestionDto],
    description: 'List of suggested questions to create or update',
  })
  suggested_questions?: CreateOnboardingSuggestedQuestionDto[];
}
