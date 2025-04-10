import { IsString, IsArray, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class PromptInfoDto {
  @IsNotEmpty({ message: 'Api token required' })
  api_token: string;

  @IsNotEmpty({ message: 'Must have prologue' })
  prompt_name?: string;

  @IsNotEmpty({ message: 'Must have prompt_info' })
  prompt_info: string;
}
