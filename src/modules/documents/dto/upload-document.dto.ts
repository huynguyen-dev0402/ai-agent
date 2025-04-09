import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';
import { FormatType } from '../entities/document.entity';
export class UploadDocumentLocalDto {
  @IsNotEmpty({ message: 'Must have token' })
  api_token: string;

  @IsNotEmpty({ message: 'Must have file base64' })
  filebase_64: string;

  @IsNotEmpty({ message: 'Must have file name' })
  name: string;

  @IsNotEmpty({ message: 'Must have type format' })
  format_type: FormatType;

  @IsNotEmpty({ message: 'Must have type file' })
  file_type: string;
}
