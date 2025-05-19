// import { Entity, PrimaryColumn, Column, CreateDateColumn } from 'typeorm';

// @Entity('transactions')
// export class TransactionEntity {
//   @PrimaryColumn()
//   id: number; // ID giao dịch trên SePay

//   @Column()
//   gateway: string; // Brand name của ngân hàng

//   @Column({ type: 'timestamp' })
//   transactionDate: Date; // Thời gian giao dịch tại ngân hàng

//   @Column()
//   accountNumber: string; // Số tài khoản ngân hàng

//   @Column({ nullable: true })
//   code: string | null; // Mã code thanh toán

//   @Column()
//   content: string; // Nội dung chuyển khoản

//   @Column()
//   transferType: 'in' | 'out'; // Loại giao dịch

//   @Column({ type: 'bigint' })
//   transferAmount: number; // Số tiền giao dịch

//   @Column({ type: 'bigint' })
//   accumulated: number; // Số dư tài khoản (lũy kế)

//   @Column({ nullable: true })
//   subAccount: string | null; // Tài khoản phụ (nếu có)

//   @Column()
//   referenceCode: string; // Mã tham chiếu

//   @Column({ type: 'text', nullable: true })
//   description: string | null; // Mô tả từ ngân hàng (tin notify)
// }
