import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsOptional,
  IsString,
  IsEnum,
  IsNumber,
  IsDateString,
} from 'class-validator';
import { Type } from 'class-transformer';
import { DEFAULT_LIMIT, DEFAULT_OFFSET } from '@common/constants/pagination.constant';

export class GetMessageHistoryDto {
  @ApiPropertyOptional({
    enum: ['active', 'ended'],
    description: 'Trạng thái cuộc trò chuyện',
  })
  @IsOptional()
  @IsEnum(['active', 'ended'])
  status?: 'active' | 'ended';

  @ApiPropertyOptional({
    type: String,
    description: 'Ngày bắt đầu (ISO 8601)',
    example: '2024-05-01T00:00:00Z',
  })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({
    type: String,
    description: 'Ngày kết thúc (ISO 8601)',
    example: '2024-05-02T23:59:59Z',
  })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiPropertyOptional({
    type: Number,
    default: 50,
    description: 'Số lượng tin nhắn trả về',
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  limit: number = DEFAULT_LIMIT;

  @ApiPropertyOptional({
    type: Number,
    default: 0,
    description: 'Số lượng bỏ qua (dùng cho phân trang)',
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  offset: number = DEFAULT_OFFSET;
}

export class GetCustomerMessageHistoryDto extends GetMessageHistoryDto {
  @ApiProperty({
    description: 'ID của người dùng (chủ chatbot)',
    example: 'user_456',
  })
  @IsString()
  userId: string;

  @ApiPropertyOptional({
    description: 'ID của chatbot',
    example: 'chatbot_789',
  })
  @IsOptional()
  @IsString()
  chatbotId?: string;
}

export class GetMessagesByAgentDto extends GetMessageHistoryDto {
  @ApiProperty({ description: 'ID của chatbot', example: 'chatbot_789' })
  @IsString()
  chatbotId: string;
}

export class GetMessagesByConversationDto extends GetMessageHistoryDto {
  @ApiProperty({ description: 'ID của conversation', example: 'chatbot_789' })
  @IsString()
  conversationId: string;
}
