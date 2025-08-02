import {
  Controller,
  Get,
  Patch,
  Param,
  Body,
  Delete,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
  Post,
} from '@nestjs/common';
import { TicketRepliesService } from './ticket-replies.service';
import { UpdateTicketReplyDto } from './dto/update-ticket-reply.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('api/ticket-replies')
@UseGuards(JwtAuthGuard)
export class TicketRepliesController {
  constructor(private readonly ticketRepliesService: TicketRepliesService) {}

  @Get('ticket/:ticketId')
  async findByTicket(@Param('ticketId') ticketId: string) {
    const replies = await this.ticketRepliesService.findByTicket(ticketId);
    return {
      success: true,
      message: 'Replies retrieved successfully',
      data: replies,
    };
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const reply = await this.ticketRepliesService.findOne(id);
    return {
      success: true,
      message: 'Reply retrieved successfully',
      data: reply,
    };
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateReplyDto: UpdateTicketReplyDto,
    @Request() req,
  ) {
    const reply = await this.ticketRepliesService.update(
      id,
      updateReplyDto,
      req.user.id,
    );
    return {
      success: true,
      message: 'Reply updated successfully',
      data: reply,
    };
  }

  @Post(':id/mark-solution')
  @HttpCode(HttpStatus.OK)
  async markAsSolution(@Param('id') id: string, @Request() req) {
    const reply = await this.ticketRepliesService.markAsSolution(
      id,
      req.user.id,
    );
    return {
      success: true,
      message: 'Reply marked as solution',
      data: reply,
    };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string, @Request() req) {
    await this.ticketRepliesService.remove(id, req.user.id);
    return {
      success: true,
      message: 'Reply deleted successfully',
    };
  }
}
