import { IsNotEmpty } from 'class-validator';

export class ModelConfigDto {
  @IsNotEmpty({ message: 'Must have model_id' })
  model_id: string;
}
