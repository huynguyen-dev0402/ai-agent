import { IsString, IsNotEmpty, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
export class CreateOnboardingSuggestedQuestionDto {
  @IsNotEmpty({ message: 'Position is required' })
  @ApiProperty({
    example: 1,
    required: false,
    description: 'position of the question (for update)',
  })
  position: number;

  @IsNotEmpty({ message: 'Question content is required' })
  @IsString()
  @ApiProperty({
    example: 'How can I help you?',
    description: 'Content of the suggested question',
  })
  question: string;
}
