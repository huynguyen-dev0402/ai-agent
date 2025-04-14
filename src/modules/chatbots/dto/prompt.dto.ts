import { IsString, IsArray, IsNotEmpty, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class PromptInfoDto {
  @IsNotEmpty({ message: 'Api token required' })
  api_token: string;

  @IsOptional()
  prompt_name?: string;

  @IsNotEmpty({ message: 'Must have prompt_info' })
  prompt_info: string;
}
