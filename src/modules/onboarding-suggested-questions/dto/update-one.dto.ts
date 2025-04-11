import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
export class UpdateOneQuestionDto {
  @IsNotEmpty({ message: 'Api token required' })
  api_token: string;

  @IsNotEmpty({ message: 'Question content is required' })
  @IsString()
  @ApiProperty({
    example: 'How can I help you?',
    description: 'Content of the suggested question',
  })
  question: string;
}
