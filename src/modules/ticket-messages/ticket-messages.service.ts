import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TicketMessage } from './entities/ticket-message.entity';
import { Repository } from 'typeorm';
import { Ticket } from '@modules/tickets/entities/ticket.entity';
import { User } from '@modules/users/entities/user.entity';
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

  async createMessage(
    userId: string,
    ticketId: string,
    dto: CreateTicketMessageDto,
  ): Promise<TicketMessage> {
    const ticket = await this.ticketRepository.findOne({
      where: { id: ticketId, user: { id: userId } },
    });
    if (!ticket) throw new NotFoundException('Ticket not found');

    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    const message = this.ticketMessageRepository.create({
      content: dto.content,
      ticket,
      user,
    });
    return await this.ticketMessageRepository.save(message);
  }

  async getMessages(
    userId: string,
    ticketId: string,
  ): Promise<TicketMessage[]> {
    const ticket = await this.ticketRepository.findOne({
      where: { id: ticketId, user: { id: userId } },
    });
    if (!ticket) throw new NotFoundException('Ticket not found');

    return this.ticketMessageRepository.find({
      where: { ticket: { id: ticketId } },
      order: { created_at: 'ASC' },
      relations: ['user'],
    });
  }
}
