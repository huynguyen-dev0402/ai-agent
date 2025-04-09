import { ValidateIf, IsNotEmpty } from 'class-validator';
import { FormatType } from '../entities/document.entity';

export class UploadMultiDto {
  //Common
  @IsNotEmpty({ message: 'Must have token' })
  api_token: string;

  @IsNotEmpty({ message: 'Must have format_type' })
  format_type: FormatType;

  @ValidateIf((o) => o.filebase_64 === undefined)
  @IsNotEmpty({ message: 'Must have source file id' })
  source_file_id?: string;

  @ValidateIf((o) => o.filebase_64 === undefined)
  @IsNotEmpty({ message: 'Must have name (image)' })
  name_image?: string;

  @ValidateIf((o) => o.filebase_64 === undefined)
  @IsNotEmpty({ message: 'Must have document_source' })
  document_source?: string;

  @ValidateIf((o) => o.source_file_id === undefined)
  @IsNotEmpty({ message: 'Must have file base64' })
  filebase_64?: string;

  @ValidateIf((o) => o.source_file_id === undefined)
  @IsNotEmpty({ message: 'Must have name (doc)' })
  name_document?: string;

  @ValidateIf((o) => o.source_file_id === undefined)
  @IsNotEmpty({ message: 'Must have file_type' })
  file_type?: string;
}
