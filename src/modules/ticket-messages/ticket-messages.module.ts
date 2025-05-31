import { Module } from '@nestjs/common';
import { TicketMessagesService } from './ticket-messages.service';
import { TicketMessagesController } from './ticket-messages.controller';

@Module({
  controllers: [TicketMessagesController],
  providers: [TicketMessagesService],
})
export class TicketMessagesModule {}
