import {
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Column,
} from 'typeorm'; // Thêm Column vào đây

export abstract class BaseEntity {
  @PrimaryGeneratedColumn('uuid') // Hoặc dùng number nếu muốn ID là số tự tăng
  id: string;

  @CreateDateColumn({
    type: 'timestamp',
    precision: 0,
    default: () => 'CURRENT_TIMESTAMP',
  })
  created_at: Date;

  @UpdateDateColumn({
    type: 'timestamp',
    precision: 0,
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updated_at: Date;

  // Thêm createdBy và updatedBy
  // Lưu ý: TypeORM không có decorator tích hợp sẵn cho createdBy/updatedBy như CreateDateColumn/UpdateDateColumn.
  // Việc cập nhật các trường này cần được xử lý thủ công, thường là trong service hoặc subscriber.
  // @Column({ type: 'uuid', nullable: true }) // Lưu ID của người dùng tạo
  // createdBy?: string;

  // @Column({ type: 'uuid', nullable: true }) // Lưu ID của người dùng cập nhật cuối cùng
  // updatedBy?: string;

  // Có thể thêm quan hệ ManyToOne đến UserEntity nếu muốn truy vấn thông tin người tạo/cập nhật
  // @ManyToOne(() => UserEntity, { nullable: true })
  // @JoinColumn({ name: 'createdBy' })
  // createdByUser?: UserEntity;
  //
  // @ManyToOne(() => UserEntity, { nullable: true })
  // @JoinColumn({ name: 'updatedBy' })
  // updatedByUser?: UserEntity;
}
