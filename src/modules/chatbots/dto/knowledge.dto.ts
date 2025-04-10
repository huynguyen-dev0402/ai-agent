import { IsArray, IsBoolean, IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class KnowledgeDto {
  @IsArray()
  @IsString({ each: true })
  @IsNotEmpty({ message: 'Must have dataset_ids' })
  dataset_ids: string[];

  @IsBoolean()
  @IsNotEmpty({ message: 'Must have auto_call' })
  auto_call: boolean;

  @IsNumber()
  @IsNotEmpty({ message: 'Must have search_strategy' })
  search_strategy: number;
}
