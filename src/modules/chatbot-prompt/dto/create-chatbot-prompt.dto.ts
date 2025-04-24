import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateChatbotPromptDto {
  @ApiProperty({
    description: 'The name of the prompt',
    type: String,
    maxLength: 255,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  promptName: string;

  @ApiProperty({
    description: 'Detailed information about the prompt',
    type: String,
  })
  @IsString()
  @IsNotEmpty()
  promptInfo: string;

  @ApiProperty({
    description: 'Optional description of the prompt',
    type: String,
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;
}
