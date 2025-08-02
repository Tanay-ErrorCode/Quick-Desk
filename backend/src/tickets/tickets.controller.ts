import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Query,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { TicketsService } from './tickets.service';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { UpdateTicketDto } from './dto/update-ticket.dto';
import { CreateTicketReplyDto } from './dto/create-ticket-reply.dto';
import { AssignTicketDto } from './dto/assign-ticket.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('api/tickets')
@UseGuards(JwtAuthGuard)
export class TicketsController {
  constructor(private readonly ticketsService: TicketsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createTicketDto: CreateTicketDto, @Request() req) {
    const ticket = await this.ticketsService.create(
      createTicketDto,
      req.user.userId,
    );
    const formattedTicket = this.ticketsService.formatTicketResponse(ticket);
    return {
      success: true,
      message: 'Ticket created successfully',
      ticket: {
        id: formattedTicket.id,
        title: formattedTicket.title,
        status: formattedTicket.status,
        created_at: formattedTicket.created_at,
      },
    };
  }

  @Get()
  async findAll(@Query() query: any, @Request() req) {
    const result = await this.ticketsService.findAll(
      query,
      req.user.userId,
      req.user.role,
    );
    return {
      success: true,
      ...result,
    };
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @Request() req) {
    const result = await this.ticketsService.findOne(
      id,
      req.user.userId,
      req.user.role,
    );
    return {
      success: true,
      ...result,
    };
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateTicketDto: UpdateTicketDto,
    @Request() req,
  ) {
    const ticket = await this.ticketsService.update(
      id,
      updateTicketDto,
      req.user.userId,
      req.user.role,
    );
    return {
      success: true,
      message: 'Ticket updated successfully',
      ticket: this.ticketsService.formatTicketResponse(ticket),
    };
  }

  @Post(':id/replies')
  @HttpCode(HttpStatus.CREATED)
  async addReply(
    @Param('id') id: string,
    @Body() createReplyDto: CreateTicketReplyDto,
    @Request() req,
  ) {
    const reply = await this.ticketsService.addReply(
      id,
      createReplyDto,
      req.user.userId,
    );
    const formattedReply = this.ticketsService.formatReplyResponse(reply);
    return {
      success: true,
      message: 'Reply added successfully',
      reply: {
        id: formattedReply.id,
        content: formattedReply.content,
        created_at: formattedReply.created_at,
      },
    };
  }

  @Post(':id/assign')
  @HttpCode(HttpStatus.OK)
  async assignTicket(
    @Param('id') id: string,
    @Body() assignDto: AssignTicketDto,
    @Request() req,
  ) {
    await this.ticketsService.assignTicket(id, assignDto, req.user.role);
    return {
      success: true,
      message: 'Ticket assigned successfully',
    };
  }

  @Post(':id/pickup')
  @HttpCode(HttpStatus.OK)
  async pickupTicket(@Param('id') id: string, @Request() req) {
    await this.ticketsService.pickupTicket(id, req.user.userId, req.user.role);
    return {
      success: true,
      message: 'Ticket picked up successfully',
    };
  }
}
