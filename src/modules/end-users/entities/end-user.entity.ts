import { Conversation } from '@modules/conversations/entities/conversation.entity';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  OneToMany,
} from 'typeorm';

export enum Platform {
  FACEBOOK = 'facebook',
  ZALO = 'zalo',
  WEBSITE = 'website',
  INSTAGRAM = 'instagram',
  LAZADA = 'lazada',
}

@Entity('end_users')
@Index('idx_end_users_external_id_platform', ['external_id', 'platform'], {
  unique: true,
})
export class EndUser {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  external_id: string;

  @Column({ type: 'enum', enum: Platform })
  platform: Platform;

  @Column({ type: 'varchar', length: 255, nullable: true })
  name?: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  email?: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  phone?: string;

  @CreateDateColumn({
    type: 'timestamp',
    nullable: true,
    default: () => 'CURRENT_TIMESTAMP',
  })
  created_at: Date;

  @UpdateDateColumn({
    type: 'timestamp',
    nullable: true,
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updated_at: Date;

  @OneToMany(() => Conversation, (conversations) => conversations.end_user)
  conversations: Conversation[];
}
