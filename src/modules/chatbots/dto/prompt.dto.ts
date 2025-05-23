import { IsString, IsArray, IsNotEmpty, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class PromptInfoDto {
  @ApiProperty({
    description: 'The name of the prompt (optional).',
    example: 'Prompt Name',
    required: false,
  })
  @IsOptional()
  prompt_name?: string;

  @ApiProperty({
    description: 'The content of the prompt that will be used by the chatbot.',
    example: 'This is the prompt information used by the chatbot.',
  })
  @IsNotEmpty({ message: 'Must have prompt_info' })
  prompt_info: string;
}
