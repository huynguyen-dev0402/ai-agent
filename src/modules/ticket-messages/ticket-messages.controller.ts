import { Controller } from '@nestjs/common';
import { TicketMessagesService } from './ticket-messages.service';

@Controller('ticket-messages')
export class TicketMessagesController {
  constructor(private readonly ticketMessagesService: TicketMessagesService) {}
}
