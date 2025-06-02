import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TicketMessage } from './entities/ticket-message.entity';
import { Repository } from 'typeorm';
import { Ticket } from '@modules/tickets/entities/ticket.entity';
import { User, UserRole } from '@modules/users/entities/user.entity';
import { CreateTicketMessageDto } from './dto/create-ticket-message.dto';

@Injectable()
export class TicketMessagesService {
  constructor(
    @InjectRepository(TicketMessage)
    private readonly ticketMessageRepository: Repository<TicketMessage>,
    @InjectRepository(Ticket)
    private readonly ticketRepository: Repository<Ticket>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  // Gửi message vào ticket
  async createMessage(
    userId: string,
    ticketId: string,
    dto: CreateTicketMessageDto,
  ) {
    const ticket = await this.ticketRepository.findOne({
      where: { id: ticketId },
      relations: ['user'],
      select: {
        id: true,
        user: {
          id: true,
          username: true,
        },
      },
    });
    if (!ticket) throw new NotFoundException('Ticket not found');

    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');
    // Chỉ chủ ticket hoặc admin mới được gửi message (tuỳ chỉnh thêm nếu cần)
    if (
      ticket.user.id !== userId &&
      user.role !== UserRole.ADMIN &&
      user.role !== UserRole.SUPER_ADMIN
    ) {
      throw new ForbiddenException(
        'You do not have permission to send message to this ticket',
      );
    }

    const message = this.ticketMessageRepository.create({
      content: dto.content,
      ticket_id: ticketId,
      user_id: userId,
    });
    this.ticketMessageRepository.save(message);
    return {
      ticket_id: ticket.id,
      message: {
        sender:
          user.role === UserRole.ADMIN || user.role === UserRole.SUPER_ADMIN
            ? 'Admin'
            : ticket.user.username,
        content: dto.content,
        created_at: new Date(),
      },
    };
  }

  // Lấy danh sách message của ticket
  async getMessages(userId: string, ticketId: string) {
    const ticket = await this.ticketRepository.findOne({
      where: { id: ticketId },
      relations: ['user'],
      select: {
        id: true,
        user: {
          id: true,
          username: true,
        },
      },
    });
    if (!ticket) throw new NotFoundException('Ticket not found');

    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');
    // Chỉ chủ ticket hoặc admin mới được gửi message (tuỳ chỉnh thêm nếu cần)
    if (
      ticket.user.id !== userId &&
      user.role !== UserRole.ADMIN &&
      user.role !== UserRole.SUPER_ADMIN
    ) {
      throw new ForbiddenException(
        'You do not have permission to send message to this ticket',
      );
    }

    const result = await this.ticketMessageRepository.find({
      where: { ticket: { id: ticketId } },
      order: { created_at: 'ASC' },
      relations: ['user'],
    });

    return result.map((message) => ({
      id: message.id,
      sender:
        message.user.role === UserRole.ADMIN ||
        message.user.role === UserRole.SUPER_ADMIN
          ? 'Admin'
          : ticket.user.username,
      content: message.content,
      created_at: message.created_at,
    }));
  }
}
