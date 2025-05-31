import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Ticket, TicketStatus } from './entities/ticket.entity';
import { Not, Repository } from 'typeorm';

@Injectable()
export class TicketsService {
  private readonly logger = new Logger(TicketsService.name);
  constructor(
    @InjectRepository(Ticket)
    private readonly ticketRepository: Repository<Ticket>,
  ) {}
  // This method is a placeholder for creating a ticket.
  async createTicket(
    userId: string,
    createTicketDto: CreateTicketDto,
  ): Promise<boolean> {
    const newTicket = this.ticketRepository.create({
      user: { id: userId },
      ...createTicketDto,
    });
    try {
      await this.ticketRepository.save(newTicket);
    } catch (error) {
      this.logger.error('Error creating ticket:', error);
      return false;
    }
    return true;
  }

  async getTickets(userId: string, status?: string): Promise<Ticket[]> {
    const query = this.ticketRepository
      .createQueryBuilder('ticket')
      .where('ticket.userId = :userId', { userId })
      .andWhere('ticket.status != :deletedStatus', {
        deletedStatus: TicketStatus.DELETED,
      });

    if (status) {
      query.andWhere('ticket.status = :status', { status });
    }

    try {
      return await query.getMany();
    } catch (error) {
      this.logger.error('Error fetching tickets:', error);
      throw new Error('Failed to fetch tickets');
    }
  }

  async getTicketById(
    userId: string,
    ticketId: string,
  ): Promise<Ticket | null> {
    const ticket = await this.ticketRepository.findOne({
      where: {
        id: ticketId,
        user: { id: userId },
        status: Not(TicketStatus.DELETED),
      },
    });

    return ticket;
  }

  async deleteTicket(userId: string, ticketId: string): Promise<boolean> {
    const ticket = await this.getTicketById(userId, ticketId);
    if (!ticket) {
      throw new NotFoundException('Ticket not found');
    }

    try {
      const result = await this.ticketRepository.update(ticketId, {
        status: TicketStatus.DELETED,
      });
      if (result.affected === 0) {
        this.logger.warn(
          'No ticket was updated, it may have already been deleted',
        );
        return false;
      }
      return true;
    } catch (error) {
      this.logger.error('Error deleting ticket:', error);
      return false;
    }
  }

  async closeTicket(userId: string, ticketId: string): Promise<boolean> {
    const ticket = await this.getTicketById(userId, ticketId);
    if (!ticket) {
      throw new NotFoundException('Ticket not found');
    }

    try {
      const result = await this.ticketRepository.update(ticketId, {
        status: TicketStatus.CLOSED,
      });
      if (result.affected === 0) {
        this.logger.warn(
          'No ticket was updated, it may have already been closed',
        );
        return false;
      }
      return true;
    } catch (error) {
      this.logger.error('Error closing ticket:', error);
      return false;
    }
  }

  async reopenTicket(userId: string, ticketId: string): Promise<boolean> {
    const ticket = await this.getTicketById(userId, ticketId);
    if (!ticket) {
      throw new NotFoundException('Ticket not found');
    }

    try {
      const result = await this.ticketRepository.update(ticketId, {
        status: TicketStatus.REOPENED,
      });
      if (result.affected === 0) {
        this.logger.warn(
          'No ticket was updated, it may have already been reopened',
        );
        return false;
      }
      return true;
    } catch (error) {
      this.logger.error('Error reopening ticket:', error);
      return false;
    }
  }
}
