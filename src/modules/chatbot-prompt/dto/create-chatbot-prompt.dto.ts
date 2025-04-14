import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateChatbotPromptDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  promptName: string;

  @IsString()
  @IsNotEmpty()
  promptInfo: string;

  @IsOptional()
  @IsString()
  description?: string;
}
