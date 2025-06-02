import {
  Controller,
  Param,
  Post,
  UseGuards,
  Body,
  Get,
  Query,
  BadRequestException,
  Delete,
  NotFoundException,
} from '@nestjs/common';
import { TicketsService } from './tickets.service';
import { UserIdMatchGuard } from '@common/guards/user-id-match.guard';
import { successResponse } from '@common/utils/response/response.util';
import { ApiOperation, ApiParam, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { CreateTicketDto } from './dto/create-ticket.dto';

@Controller()
export class TicketsController {
  constructor(private readonly ticketsService: TicketsService) {}
  // This method is a placeholder for creating a ticket.
  @Post('users/:userId/tickets')
  @UseGuards(UserIdMatchGuard)
  @ApiOperation({ summary: 'Create a new ticket for a user' })
  @ApiParam({ name: 'userId', required: true, description: 'ID of the user' })
  @ApiResponse({
    status: 201,
    description: 'Ticket created successfully.',
  })
  @ApiResponse({
    status: 400,
    description: 'Failed to create ticket.',
  })
  async createTicket(
    @Param('userId') userId: string,
    @Body() createTicketDto: CreateTicketDto,
  ) {
    const result = await this.ticketsService.createTicket(
      userId,
      createTicketDto,
    );
    if (!result) {
      throw new BadRequestException('Failed to create ticket');
    }
    return successResponse('Ticket created successfully.');
  }

  @Get('users/:userId/tickets')
  @UseGuards(UserIdMatchGuard)
  @ApiOperation({ summary: 'Get list of tickets by user' })
  @ApiParam({ name: 'userId', required: true, description: 'ID of the user' })
  @ApiQuery({
    name: 'status',
    required: false,
    description: 'Filter by ticket status',
  })
  @ApiResponse({
    status: 200,
    description: 'List of tickets returned successfully.',
  })
  async getTickets(
    @Param('userId') userId: string,
    @Query('status') status?: string,
  ) {
    const tickets = await this.ticketsService.getTickets(userId, status);
    return {
      success: true,
      message: 'Get ticket list successfully.',
      data: tickets,
    };
  }

  @Get('users/:userId/tickets/:ticketId')
  @UseGuards(UserIdMatchGuard)
  @ApiOperation({ summary: 'Get ticket by ID' })
  @ApiParam({ name: 'userId', required: true, description: 'ID of the user' })
  @ApiParam({
    name: 'ticketId',
    required: true,
    description: 'ID of the ticket',
  })
  @ApiResponse({
    status: 200,
    description: 'Ticket details returned successfully.',
  })
  async getTicketById(
    @Param('userId') userId: string,
    @Param('ticketId') ticketId: string,
  ) {
    const ticket = await this.ticketsService.getTicketById(userId, ticketId);
    if (!ticket) {
      throw new NotFoundException('Ticket not found or has been deleted');
    }
    return {
      success: true,
      message: 'Get ticket details successfully.',
      data: ticket, 
    };
  }

  @Post('users/:userId/tickets/:ticketId/close')
  @UseGuards(UserIdMatchGuard)
  @ApiOperation({ summary: 'Close a ticket by ID' })
  @ApiParam({ name: 'userId', required: true, description: 'ID of the user' })
  @ApiParam({
    name: 'ticketId',
    required: true,
    description: 'ID of the ticket',
  })
  @ApiResponse({
    status: 200,
    description: 'Ticket closed successfully.',
  })
  async closeTicket(
    @Param('userId') userId: string,
    @Param('ticketId') ticketId: string,
  ) {
    const result = await this.ticketsService.closeTicket(userId, ticketId);
    if (!result) {
      throw new BadRequestException('Failed to close ticket');
    }
    return successResponse('Ticket closed successfully.');
  }

  @Post('users/:userId/tickets/:ticketId/reopen')
  @UseGuards(UserIdMatchGuard)
  @ApiOperation({ summary: 'Reopen a closed ticket by ID' })
  @ApiParam({ name: 'userId', required: true, description: 'ID of the user' })
  @ApiParam({
    name: 'ticketId',
    required: true,
    description: 'ID of the ticket',
  })
  @ApiResponse({
    status: 200,
    description: 'Ticket reopened successfully.',
  })
  async reopenTicket(
    @Param('userId') userId: string,
    @Param('ticketId') ticketId: string,
  ) {
    const result = await this.ticketsService.reopenTicket(userId, ticketId);
    if (!result) {
      throw new BadRequestException('Failed to reopen ticket');
    }
    return successResponse('Ticket reopened successfully.');
  }

  @Delete('users/:userId/tickets/:ticketId')
  @UseGuards(UserIdMatchGuard)
  @ApiOperation({ summary: 'Delete a ticket by ID' })
  @ApiParam({ name: 'userId', required: true, description: 'ID of the user' })
  @ApiParam({
    name: 'ticketId',
    required: true,
    description: 'ID of the ticket',
  })
  @ApiResponse({
    status: 200,
    description: 'Ticket deleted successfully.',
  })
  async deleteTicket(
    @Param('userId') userId: string,
    @Param('ticketId') ticketId: string,
  ) {
    const result = await this.ticketsService.deleteTicket(userId, ticketId);
    if (!result) {
      throw new BadRequestException('Failed to delete ticket');
    }
    return successResponse('Ticket deleted successfully.');
  }
}
