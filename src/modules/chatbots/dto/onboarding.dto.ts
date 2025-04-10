import { IsString, IsArray, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class OnboardingInfoDto {
  @IsNotEmpty({ message: 'Api token required' })
  api_token: string;
  
  @IsString()
  @ApiProperty({ example: 'Welcome to the chatbot!' })
  @IsNotEmpty({ message: 'Must have prologue' })
  prologue: string;

  @IsArray()
  @IsString({ each: true })
  @ApiProperty({
    example: ['How can I help you?', 'What do you want to know?'],
  })
  @IsNotEmpty({ message: 'Must have suggested_questions' })
  suggested_questions: string[];
}
