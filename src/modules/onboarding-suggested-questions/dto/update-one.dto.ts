import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateOneQuestionDto {
  @IsNotEmpty({ message: 'Api token required' })
  @ApiProperty({
    example: 'your-api-token',
    description: 'The API token for authorization.',
  })
  api_token: string;

  @IsNotEmpty({ message: 'Position is required' })
  @ApiProperty({
    example: 1,
    required: true,
    description:
      'Position of the question. Used for updating the order or placement of the question.',
  })
  position: number;

  @IsNotEmpty({ message: 'Question content is required' })
  @IsString()
  @ApiProperty({
    example: 'How can I help you?',
    description:
      'Content of the suggested question. This is the question text that will be updated.',
  })
  question: string;
}
