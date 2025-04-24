import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional } from 'class-validator';

export class CreateResourceDto {
  @ApiProperty({
    example: 'token',
    description: 'API token to authenticate the request.',
  })
  @IsNotEmpty({ message: 'Token required' })
  api_token: string;

  @ApiProperty({
    example: 'Name resource demo',
    description: 'The name of the resource.',
  })
  @IsNotEmpty({ message: 'Name resource required' })
  resource_name: string;

  @ApiProperty({
    example: '1234567***',
    description: 'The external space ID associated with the resource.',
  })
  @IsNotEmpty({ message: 'External space id required' })
  external_space_id: string;

  @ApiProperty({
    example: 'text',
    description:
      'The external type name ID representing the type of the resource.',
  })
  @IsNotEmpty({ message: 'External type name required' })
  external_type_name: string;

  @ApiProperty({
    example: 'Description of the chatbot resource',
    description: 'A brief description of the resource.',
  })
  @IsOptional()
  description?: string;

  @ApiProperty({
    example: '123456***',
    description: 'An optional ID for the resource icon.',
  })
  @IsOptional()
  external_icon_id?: string;
}
