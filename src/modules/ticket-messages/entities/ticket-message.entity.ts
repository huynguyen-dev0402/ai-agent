import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  JoinColumn,
} from 'typeorm';
import { User } from '@modules/users/entities/user.entity';
import { ApiProperty } from '@nestjs/swagger';
import { Ticket } from '@modules/tickets/entities/ticket.entity';

@Entity('ticket_messages')
export class TicketMessage {
  @ApiProperty({
    example: 'b1a2c3d4-5678-90ab-cdef-1234567890ab',
    description: 'Message ID',
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({
    example: 'I need help with my account.',
    description: 'Message content',
  })
  @Column({ type: 'text' })
  content: string;

  @ApiProperty({ type: () => Ticket, description: 'Related ticket' })
  @ManyToOne(() => Ticket, (ticket) => ticket.ticket_messages, {
    nullable: false,
  })
  @JoinColumn({ name: 'ticket_id' })
  ticket: Ticket;

  @ApiProperty({ type: () => User, description: 'User who sent the message' })
  @ManyToOne(() => User, (user) => user.ticket_messages, { nullable: false })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ApiProperty({
    example: '2024-05-31T12:00:00.000Z',
    description: 'Created at',
  })
  @CreateDateColumn()
  created_at: Date;
}
