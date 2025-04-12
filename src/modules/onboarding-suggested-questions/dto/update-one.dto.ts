import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
export class UpdateOneQuestionDto {
  @IsNotEmpty({ message: 'Api token required' })
  api_token: string;

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
