import { ValidateIf, IsNotEmpty } from 'class-validator';
import { FormatType } from '../entities/document.entity';

export class GetImagesDto {
  @IsNotEmpty({ message: 'Must have token' })
  api_token: string;

  @IsNotEmpty({ message: 'Must have external resource id' })
  external_resource_id: string;
}
