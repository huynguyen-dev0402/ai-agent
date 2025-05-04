import { ApiProperty } from '@nestjs/swagger';
import { ValidateIf, IsNotEmpty } from 'class-validator';
import { FormatType } from '@modules/documents/entities/document.entity';

export class UploadMultiDto {
  // Common
  @ApiProperty({
    description: 'API token required for authorization.',
    example: 'your-api-token-here',
  })
  @IsNotEmpty({ message: 'Must have token' })
  api_token: string;

  @ApiProperty({
    description: 'Format type for the document.',
    example: 'pdf',
  })
  @IsNotEmpty({ message: 'Must have format_type' })
  format_type: FormatType;

  @ApiProperty({
    description:
      'Source file ID for the document (required if filebase_64 is not provided).',
    example: 'source-file-id-123',
    required: false,
  })
  @ValidateIf((o) => o.filebase_64 === undefined)
  @IsNotEmpty({ message: 'Must have source file id' })
  source_file_id?: string;

  @ApiProperty({
    description: 'Name of the image (required if filebase_64 is not provided).',
    example: 'image.jpg',
    required: false,
  })
  @ValidateIf((o) => o.filebase_64 === undefined)
  @IsNotEmpty({ message: 'Must have name (image)' })
  name_image?: string;

  @ApiProperty({
    description: 'Document source (required if filebase_64 is not provided).',
    example: 1,
    required: false,
  })
  @ValidateIf((o) => o.filebase_64 === undefined)
  @IsNotEmpty({ message: 'Must have document_source' })
  document_source?: number;

  @ApiProperty({
    description:
      'File in base64 format (required if source_file_id is not provided).',
    example: 'data:image/png;base64,...',
    required: false,
  })
  @ValidateIf((o) => o.source_file_id === undefined)
  @IsNotEmpty({ message: 'Must have file base64' })
  filebase_64?: string;

  @ApiProperty({
    description:
      'Name of the document (required if filebase_64 is not provided).',
    example: 'document.pdf',
    required: false,
  })
  @ValidateIf((o) => o.source_file_id === undefined)
  @IsNotEmpty({ message: 'Must have name (doc)' })
  name_document?: string;

  @ApiProperty({
    description: 'File type (required if filebase_64 is not provided).',
    example: 'application/pdf',
    required: false,
  })
  @ValidateIf((o) => o.source_file_id === undefined)
  @IsNotEmpty({ message: 'Must have file_type' })
  file_type?: string;
}
