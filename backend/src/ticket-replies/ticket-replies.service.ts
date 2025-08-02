import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  TicketReply,
  TicketReplyDocument,
} from './schemas/ticket-reply.schema';
import { Ticket, TicketDocument } from '../tickets/schemas/ticket.schema';
import { UpdateTicketReplyDto } from './dto/update-ticket-reply.dto';

@Injectable()
export class TicketRepliesService {
  constructor(
    @InjectModel(TicketReply.name)
    private ticketReplyModel: Model<TicketReplyDocument>,
    @InjectModel(Ticket.name) private ticketModel: Model<TicketDocument>,
  ) {}

  async findByTicket(ticketId: string): Promise<TicketReplyDocument[]> {
    if (!Types.ObjectId.isValid(ticketId)) {
      throw new BadRequestException('Invalid ticket ID');
    }

    const ticket = await this.ticketModel.findById(ticketId);
    if (!ticket) {
      throw new NotFoundException('Ticket not found');
    }

    return this.ticketReplyModel
      .find({ ticket_id: ticketId })
      .populate('user_id', 'name email')
      .sort({ created_at: 1 })
      .exec();
  }

  async findOne(id: string): Promise<TicketReplyDocument> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid reply ID');
    }

    const reply = await this.ticketReplyModel
      .findById(id)
      .populate('user_id', 'name email')
      .exec();

    if (!reply) {
      throw new NotFoundException('Reply not found');
    }

    return reply;
  }

  async update(
    id: string,
    updateReplyDto: UpdateTicketReplyDto,
    userId: string,
  ): Promise<TicketReplyDocument> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid reply ID');
    }

    const reply = await this.ticketReplyModel.findById(id);
    if (!reply) {
      throw new NotFoundException('Reply not found');
    }

    // Only the author can edit their reply
    if (reply.user_id.toString() !== userId) {
      throw new BadRequestException('You can only edit your own replies');
    }

    const updatedReply = await this.ticketReplyModel
      .findByIdAndUpdate(id, updateReplyDto, { new: true })
      .populate('user_id', 'name email')
      .exec();

    if (!updatedReply) {
      throw new NotFoundException('Reply not found after update');
    }

    return updatedReply;
  }

  async markAsSolution(
    id: string,
    userId: string,
  ): Promise<TicketReplyDocument> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid reply ID');
    }

    const reply = await this.ticketReplyModel
      .findById(id)
      .populate('ticket_id');
    if (!reply) {
      throw new NotFoundException('Reply not found');
    }

    // Only ticket author or support agents can mark as solution
    const ticket = reply.ticket_id as any;
    if (ticket.author_id.toString() !== userId) {
      throw new BadRequestException(
        'Only the ticket author can mark replies as solution',
      );
    }

    // Unmark previous solution
    await this.ticketReplyModel.updateMany(
      { ticket_id: ticket._id },
      { is_solution: false },
    );

    const updatedReply = await this.ticketReplyModel
      .findByIdAndUpdate(id, { is_solution: true }, { new: true })
      .populate('user_id', 'name email')
      .exec();

    if (!updatedReply) {
      throw new NotFoundException('Reply not found after update');
    }

    return updatedReply;
  }

  async remove(id: string, userId: string): Promise<void> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid reply ID');
    }

    const reply = await this.ticketReplyModel.findById(id);
    if (!reply) {
      throw new NotFoundException('Reply not found');
    }

    // Only the author can delete their reply
    if (reply.user_id.toString() !== userId) {
      throw new BadRequestException('You can only delete your own replies');
    }

    await this.ticketReplyModel.findByIdAndDelete(id);

    // Decrease reply count in ticket
    await this.ticketModel.findByIdAndUpdate(reply.ticket_id, {
      $inc: { reply_count: -1 },
    });
  }
}
