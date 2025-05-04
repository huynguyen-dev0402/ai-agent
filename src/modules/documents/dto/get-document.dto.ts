import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class GetDocumentDto {
  @ApiProperty({
    description: 'API token required for authorization.',
    example: 'your-api-token-here',
  })
  @IsNotEmpty({ message: 'Must have token' })
  api_token: string;

  @ApiProperty({
    description: 'External resource ID associated with the document.',
    example: 'external-resource-id-123',
  })
  @IsNotEmpty({ message: 'Must have external resource id' })
  external_resource_id: string;
}
