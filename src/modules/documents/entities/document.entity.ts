import { Resource } from 'src/modules/resources/entities/resource.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum SourceTypeImage {
  TYPE_0 = 0,
  TYPE_5 = 5,
}

export enum FormatType {
  TYPE_0 = '0',
  TYPE_2 = '2',
}

@Entity('documents')
export class Document {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  source_file_id: string;

  @Column({ type: 'enum', enum: SourceTypeImage, nullable: true })
  source_type: SourceTypeImage;

  @Column({
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  external_document_id?: string;

  @Column({ type: 'enum', enum: FormatType, nullable: true })
  format_type: FormatType;

  @Column({ type: 'varchar', length: 255, nullable: true })
  document_name: string;

  @Column({ type: 'text', nullable: true })
  caption: string;

  @Column({ type: 'text', nullable: true })
  web_url: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  type: string;

  @Column({ type: 'text', nullable: true })
  icon_url: string;

  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt: Date;

  @UpdateDateColumn({
    name: 'updated_at',
    type: 'timestamp',
    nullable: true,
  })
  updatedAt: Date;

  @ManyToOne(() => Resource, (resource) => resource.documents, {
    nullable: false,
  })
  @JoinColumn({ name: 'resource_id' })
  resource: Resource;
}
