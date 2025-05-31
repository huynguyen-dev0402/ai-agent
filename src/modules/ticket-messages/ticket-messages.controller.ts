import {
  Controller,
  Post,
  Body,
  Param,
  Get,
  UseGuards,
  NotFoundException,
} from '@nestjs/common';
import { TicketMessagesService } from './ticket-messages.service';
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { UserIdMatchGuard } from '@common/guards/user-id-match.guard';
import { CreateTicketMessageDto } from './dto/create-ticket-message.dto';
import { AuthGuard } from '@modules/auth/guards/jwt-auth.guard';

@ApiTags('Ticket Messages')
@UseGuards(AuthGuard) 
@Controller('users/:userId/tickets/:ticketId/messages')
export class TicketMessagesController {
  constructor(private readonly ticketMessagesService: TicketMessagesService) {}

  @Post()
  @UseGuards(UserIdMatchGuard)
  @ApiOperation({ summary: 'Send a message in a ticket' })
  @ApiParam({ name: 'userId', required: true, description: 'ID of the user' })
  @ApiParam({
    name: 'ticketId',
    required: true,
    description: 'ID of the ticket',
  })
  @ApiResponse({ status: 201, description: 'Message sent successfully.' })
  async createMessage(
    @Param('userId') userId: string,
    @Param('ticketId') ticketId: string,
    @Body() dto: CreateTicketMessageDto,
  ) {
    const result = await this.ticketMessagesService.createMessage(
      userId,
      ticketId,
      dto,
    );
    if (!result)
      throw new NotFoundException('Ticket not found or cannot send message');
    return {
      success: true,
      message: 'Message sent successfully.',
      data: result,
    };
  }

  @Get()
  @UseGuards(UserIdMatchGuard)
  @ApiOperation({ summary: 'Get all messages in a ticket' })
  @ApiParam({ name: 'userId', required: true, description: 'ID of the user' })
  @ApiParam({
    name: 'ticketId',
    required: true,
    description: 'ID of the ticket',
  })
  @ApiResponse({
    status: 200,
    description: 'List of messages returned successfully.',
  })
  async getMessages(
    @Param('userId') userId: string,
    @Param('ticketId') ticketId: string,
  ) {
    const result = await this.ticketMessagesService.getMessages(
      userId,
      ticketId,
    );
    return {
      success: true,
      message: 'Get messages successfully.',
      data: result,
    };
  }
}
