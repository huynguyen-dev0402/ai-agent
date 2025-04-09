import { Document } from 'src/modules/documents/entities/document.entity';
import { User } from 'src/modules/users/entities/user.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';

export enum ExternalType {
  TEXT = '0',
  IMAGE = '2',
}

export enum ExternalTypeName {
  TEXT = 'text',
  IMAGE = 'image',
}

export enum ResourceStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
}

@Entity('resources')
@Index('idx_resources_user_id', ['user_id'])
@Index('idx_resources_external_resource_id', ['external_resource_id'])
@Index('idx_resources_external_type', ['external_type'])
@Index('idx_resources_external_type_name', ['external_type_name'])
export class Resource {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  user_id: string;

  @Column({ type: 'text', nullable: true })
  external_icon_url: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  external_resource_id: string;

  @Column({ type: 'enum', enum: ExternalType })
  external_type: ExternalType;

  @Column({ type: 'enum', enum: ExternalTypeName })
  external_type_name: ExternalTypeName;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({
    type: 'enum',
    enum: ResourceStatus,
    default: ResourceStatus.ACTIVE,
  })
  status: ResourceStatus;

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

  @ManyToOne(() => User, (user) => user.resources)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @OneToMany(() => Document, (document) => document.resource)
  documents: Document[];
}
