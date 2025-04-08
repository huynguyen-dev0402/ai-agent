import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsOptional } from "class-validator";

export class CreateResourceDto {
  @ApiProperty({
    example: 'token',
    description: 'Token',
  })
  @IsNotEmpty({ message: 'Token required' })
  api_token: string;

  @ApiProperty({
    example: 'Name resource demo',
    description: 'Name resource',
  })
  @IsNotEmpty({ message: 'Name resource required' })
  resource_name: string;

  @ApiProperty({
    example: '1234567***',
    description: 'external space id',
  })
  @IsNotEmpty({ message: 'External space id required' })
  external_space_id: string;

  @ApiProperty({
    example: 'text',
    description: 'external type name id',
  })
  @IsNotEmpty({ message: 'External type name required' })
  external_type_name: string;

  @ApiProperty({
    example: 'Desciption chatbot',
    description: 'Desciption chatbot',
  })
  @IsOptional()
  description?: string;

  @ApiProperty({ example: '123456***', description: 'Image' })
  @IsOptional()
  external_icon_id?: string;
}
