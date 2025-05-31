import { IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateTicketDto {
  @ApiProperty({
    description: 'Ticket subject',
    maxLength: 255,
    example: 'Cannot log in to the system',
  })
  @IsString({ message: 'Subject must be a string' })
  @IsNotEmpty({ message: 'Subject is required' })
  @MaxLength(255, { message: 'Subject can have up to 255 characters' })
  subject: string;

  @ApiProperty({
    description: 'Detailed content of the ticket',
    example: 'I have tried many times but cannot log in to the system.',
  })
  @IsString({ message: 'Description must be a string' })
  @IsNotEmpty({ message: 'Description is required' })
  description: string;
}
