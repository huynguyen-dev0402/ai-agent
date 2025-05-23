import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsString,
} from 'class-validator';

export class KnowledgeDto {

  @ApiProperty({
    description: 'List of dataset IDs to be used.',
    example: ['dataset_id_1', 'dataset_id_2'],
    type: [String],
  })
  @IsArray()
  @IsString({ each: true })
  @IsNotEmpty({ message: 'Must have dataset_ids' })
  dataset_ids: string[];

  @ApiProperty({
    description:
      'Flag to enable or disable auto call for the knowledge process.',
    example: true,
  })
  @IsBoolean()
  @IsNotEmpty({ message: 'Must have auto_call' })
  auto_call: boolean;

  @ApiProperty({
    description: 'Search strategy used for processing.',
    example: 1,
    type: Number,
  })
  @IsNumber()
  @IsNotEmpty({ message: 'Must have search_strategy' })
  search_strategy: number;
}
