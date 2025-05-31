import { Module } from '@nestjs/common';
import { TicketMessagesService } from './ticket-messages.service';
import { TicketMessagesController } from './ticket-messages.controller';
import { Ticket } from '@modules/tickets/entities/ticket.entity';
import { User } from '@modules/users/entities/user.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TicketMessage } from './entities/ticket-message.entity';
import { AuthModule } from '@modules/auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([TicketMessage, Ticket, User]),
    AuthModule
  ],
  controllers: [TicketMessagesController],
  providers: [TicketMessagesService],
})
export class TicketMessagesModule {}
