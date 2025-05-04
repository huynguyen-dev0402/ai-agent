import {  IsNotEmpty } from 'class-validator';

export class GetImagesDto {
  @IsNotEmpty({ message: 'Must have token' })
  api_token: string;

  @IsNotEmpty({ message: 'Must have external resource id' })
  external_resource_id: string;
}
