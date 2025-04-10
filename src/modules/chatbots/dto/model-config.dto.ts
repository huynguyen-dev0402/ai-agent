import { IsNotEmpty } from 'class-validator';

export class ModelConfigDto {
  @IsNotEmpty({ message: 'Api token required' })
  api_token: string;
  
  @IsNotEmpty({ message: 'Must have model_id' })
  model_id: string;
}
