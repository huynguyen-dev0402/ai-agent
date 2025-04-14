import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional } from 'class-validator';

export class GetConfigDto {
  @IsNotEmpty({ message: 'Api token required' })
  api_token: string;

}
