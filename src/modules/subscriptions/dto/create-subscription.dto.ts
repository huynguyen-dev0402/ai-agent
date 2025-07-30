import {
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsPositive,
  IsString,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateSubscriptionDto {
  @ApiProperty({
    example: 'Basic Plan',
    description: 'Name of the subscription plan',
  })
  @IsString({ message: 'The name must be a string' })
  @IsNotEmpty({ message: 'The name cannot be empty' })
  name: string;

  @ApiProperty({
    example: 1001,
    description: 'Unique subscription code',
  })
  @IsInt({ message: 'The subscription code must be an integer' })
  @IsPositive({ message: 'The subscription code must be greater than 0' })
  subscription_code: number;

  @ApiProperty({
    example: 1000,
    description: 'The maximum number of messages the user can use in this plan',
  })
  @IsInt({ message: 'The message limit must be an integer' })
  @IsPositive({ message: 'The message limit must be greater than 0' })
  message_limit: number;

  @ApiProperty({
    example: 50,
    description: 'The number of knowledge pieces that can be uploaded',
  })
  @IsInt({ message: 'The knowledge limit must be an integer' })
  @IsPositive({ message: 'The knowledge limit must be greater than 0' })
  knowledge_limit: number;

  @ApiProperty({
    example: 5,
    description: 'The maximum number of members in the plan',
  })
  @IsInt({ message: 'The member limit must be an integer' })
  @IsPositive({ message: 'The member limit must be greater than 0' })
  member_limit: number;

  @ApiProperty({
    example: 3,
    description: 'The number of agents that can be created in the plan',
  })
  @IsInt({ message: 'The agent limit must be an integer' })
  @IsPositive({ message: 'The agent limit must be greater than 0' })
  agent_limit: number;

  @ApiProperty({
    example: false,
    description: 'Whether the plan is a custom plan',
  })
  @IsBoolean({ message: 'The is_custom field must be true or false' })
  is_custom: boolean;

  @ApiProperty({ example: 49000, description: 'The price of the plan (VND)' })
  @IsNumber({}, { message: 'The price must be a number' })
  @IsPositive({ message: 'The price must be greater than 0' })
  price: number;

  @ApiProperty({
    example: 1,
    description: 'The duration of the plan (in months)',
  })
  @IsInt({ message: 'The duration must be an integer' })
  @IsPositive({ message: 'The duration must be greater than 0' })
  duration_months: number;
}
