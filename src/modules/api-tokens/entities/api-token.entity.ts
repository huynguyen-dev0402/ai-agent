import { User } from '@modules/users/entities/user.entity';
import { ApiProperty } from '@nestjs/swagger';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';

export enum TokenStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
}

@Entity('api_tokens')
export class ApiToken {
  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'Unique identifier for the API token',
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({
    example: 'Production API Token',
    description: 'Name of the API token',
  })
  @Column({ type: 'varchar', length: 255, nullable: false })
  token_name: string;

  @ApiProperty({
    example: 'API token for production environment access',
    description: 'Description of the API token',
    required: false,
  })
  @Column({ type: 'text', nullable: true })
  description: string;

  @ApiProperty({
    example: 'sk-1234567890abcdef...',
    description: 'The actual API token string',
  })
  @Column({ type: 'varchar', length: 255, nullable: false, unique: true })
  token: string;

  @ApiProperty({
    example: TokenStatus.ACTIVE,
    description: 'Status of the API token',
    enum: TokenStatus,
  })
  @Column({ type: 'enum', enum: TokenStatus, default: TokenStatus.ACTIVE })
  status: TokenStatus;

  @ApiProperty({
    example: '2024-07-28T15:30:00.000Z',
    description: 'Date when the token was created',
  })
  @CreateDateColumn({
    type: 'timestamp',
    nullable: true,
    precision: 0,
    default: () => 'CURRENT_TIMESTAMP',
  })
  created_at: Date;

  @ApiProperty({
    example: '2025-12-31T23:59:59.000Z',
    description: 'Expiration date of the API token',
  })
  @CreateDateColumn({
    type: 'timestamp',
    nullable: false,
  })
  expires_at: Date;

  @ApiProperty({
    example: '2024-07-28T15:30:00.000Z',
    description: 'Date when the token was last updated',
  })
  @UpdateDateColumn({
    type: 'timestamp',
    nullable: true,
    precision: 0,
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updated_at: Date;

  @OneToMany(() => User, (user) => user.api_token)
  users: User[];
}
