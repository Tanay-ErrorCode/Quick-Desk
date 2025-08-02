import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Ticket, TicketDocument, TicketStatus } from './schemas/ticket.schema';
import {
  TicketReply,
  TicketReplyDocument,
} from '../ticket-replies/schemas/ticket-reply.schema';
import {
  Category,
  CategoryDocument,
} from '../categories/schemas/category.schema';
import { Tag, TagDocument } from '../tags/schemas/tag.schema';
import { User, UserDocument, UserRole } from '../users/schemas/user.schema';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { UpdateTicketDto } from './dto/update-ticket.dto';
import { CreateTicketReplyDto } from './dto/create-ticket-reply.dto';
import { AssignTicketDto } from './dto/assign-ticket.dto';

@Injectable()
export class TicketsService {
  constructor(
    @InjectModel(Ticket.name) private ticketModel: Model<TicketDocument>,
    @InjectModel(TicketReply.name)
    private ticketReplyModel: Model<TicketReplyDocument>,
    @InjectModel(Category.name) private categoryModel: Model<CategoryDocument>,
    @InjectModel(Tag.name) private tagModel: Model<TagDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {}

  async create(
    createTicketDto: CreateTicketDto,
    authorId: string,
  ): Promise<TicketDocument> {
    // Verify category exists
    const category = await this.categoryModel.findById(
      createTicketDto.category_id,
    );
    if (!category) {
      throw new BadRequestException('Category not found');
    }

    // Verify tags exist if provided
    if (createTicketDto.tags?.length) {
      const tagsCount = await this.tagModel.countDocuments({
        _id: { $in: createTicketDto.tags },
      });
      if (tagsCount !== createTicketDto.tags.length) {
        throw new BadRequestException('One or more tags not found');
      }
    }

    const ticketData = {
      ...createTicketDto,
      author_id: new Types.ObjectId(authorId),
      category_id: new Types.ObjectId(createTicketDto.category_id),
      tags:
        createTicketDto.tags?.map((tagId) => new Types.ObjectId(tagId)) || [],
    };

    const ticket = new this.ticketModel(ticketData);
    return ticket.save();
  }

  async findAll(query: any, userId: string, userRole: string) {
    const {
      page = 1,
      limit = 10,
      status,
      category,
      priority,
      assigned_to,
      search,
    } = query;

    const filter: any = {};

    // Role-based filtering
    if (userRole === UserRole.END_USER) {
      filter.author_id = new Types.ObjectId(userId);
    }

    if (status) filter.status = status;
    if (category) filter.category_id = new Types.ObjectId(category);
    if (priority) filter.priority = priority;

    if (assigned_to) {
      if (assigned_to === 'me') {
        filter.assigned_to = new Types.ObjectId(userId);
      } else {
        filter.assigned_to = new Types.ObjectId(assigned_to);
      }
    }

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (page - 1) * limit;
    const total = await this.ticketModel.countDocuments(filter);

    const tickets = await this.ticketModel
      .find(filter)
      .populate('category_id', 'name color')
      .populate('author_id', 'name email')
      .populate('assigned_to', 'name email')
      .populate('tags', 'name color')
      .sort({ created_at: -1 })
      .skip(skip)
      .limit(Number(limit))
      .exec();

    return {
      data: tickets.map((ticket) => this.formatTicketResponse(ticket)),
      pagination: {
        current_page: Number(page),
        per_page: Number(limit),
        total,
        total_pages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string, userId: string, userRole: string): Promise<any> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid ticket ID');
    }

    const ticket = await this.ticketModel
      .findById(id)
      .populate('category_id', 'name color icon')
      .populate('author_id', 'name email')
      .populate('assigned_to', 'name email')
      .populate('tags', 'name color')
      .exec();

    if (!ticket) {
      throw new NotFoundException('Ticket not found');
    }

    // Check permissions
    if (
      userRole === UserRole.END_USER &&
      ticket.author_id._id.toString() !== userId
    ) {
      throw new ForbiddenException('You can only view your own tickets');
    }

    const replies = await this.ticketReplyModel
      .find({ ticket_id: ticket._id })
      .populate('user_id', 'name email')
      .sort({ created_at: 1 })
      .exec();

    return {
      ticket: this.formatTicketResponse(ticket),
      replies: replies.map((reply) => this.formatReplyResponse(reply)),
      attachments: [], // TODO: Implement attachments
    };
  }

  async update(
    id: string,
    updateTicketDto: UpdateTicketDto,
    userId: string,
    userRole: string,
  ): Promise<TicketDocument> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid ticket ID');
    }

    const ticket = await this.ticketModel.findById(id);
    if (!ticket) {
      throw new NotFoundException('Ticket not found');
    }

    // Check permissions
    const canEdit =
      userRole === UserRole.ADMIN ||
      userRole === UserRole.SUPPORT_AGENT ||
      (userRole === UserRole.END_USER &&
        ticket.author_id.toString() === userId);

    if (!canEdit) {
      throw new ForbiddenException(
        'You do not have permission to edit this ticket',
      );
    }

    // Update timestamps based on status changes
    const updateData: any = { ...updateTicketDto };

    if (updateTicketDto.status) {
      switch (updateTicketDto.status) {
        case TicketStatus.RESOLVED:
          updateData.resolved_at = new Date();
          break;
        case TicketStatus.CLOSED:
          updateData.closed_at = new Date();
          break;
      }
    }

    const updatedTicket = await this.ticketModel
      .findByIdAndUpdate(id, updateData, { new: true })
      .populate('category_id', 'name color')
      .populate('author_id', 'name email')
      .populate('assigned_to', 'name email')
      .exec();

    if (!updatedTicket) {
      throw new NotFoundException('Ticket not found after update');
    }

    return updatedTicket;
  }

  async addReply(
    ticketId: string,
    createReplyDto: CreateTicketReplyDto,
    userId: string,
  ): Promise<TicketReplyDocument> {
    if (!Types.ObjectId.isValid(ticketId)) {
      throw new BadRequestException('Invalid ticket ID');
    }

    const ticket = await this.ticketModel.findById(ticketId);
    if (!ticket) {
      throw new NotFoundException('Ticket not found');
    }

    const reply = new this.ticketReplyModel({
      ...createReplyDto,
      ticket_id: new Types.ObjectId(ticketId),
      user_id: new Types.ObjectId(userId),
    });

    const savedReply = await reply.save();

    // Update ticket reply count and last reply time
    await this.ticketModel.findByIdAndUpdate(ticketId, {
      $inc: { reply_count: 1 },
      last_reply_at: new Date(),
    });

    return savedReply;
  }

  async assignTicket(
    ticketId: string,
    assignDto: AssignTicketDto,
    userRole: string,
  ): Promise<void> {
    if (userRole !== UserRole.ADMIN && userRole !== UserRole.SUPPORT_AGENT) {
      throw new ForbiddenException(
        'Only admins and support agents can assign tickets',
      );
    }

    if (
      !Types.ObjectId.isValid(ticketId) ||
      !Types.ObjectId.isValid(assignDto.assigned_to)
    ) {
      throw new BadRequestException('Invalid ticket ID or user ID');
    }

    const ticket = await this.ticketModel.findById(ticketId);
    if (!ticket) {
      throw new NotFoundException('Ticket not found');
    }

    const assignee = await this.userModel.findById(assignDto.assigned_to);
    if (!assignee) {
      throw new BadRequestException('Assignee not found');
    }

    await this.ticketModel.findByIdAndUpdate(ticketId, {
      assigned_to: new Types.ObjectId(assignDto.assigned_to),
      assigned_at: new Date(),
    });
  }

  async pickupTicket(
    ticketId: string,
    userId: string,
    userRole: string,
  ): Promise<void> {
    if (userRole !== UserRole.SUPPORT_AGENT) {
      throw new ForbiddenException('Only support agents can pick up tickets');
    }

    if (!Types.ObjectId.isValid(ticketId)) {
      throw new BadRequestException('Invalid ticket ID');
    }

    const ticket = await this.ticketModel.findById(ticketId);
    if (!ticket) {
      throw new NotFoundException('Ticket not found');
    }

    if (ticket.assigned_to) {
      throw new BadRequestException('Ticket is already assigned');
    }

    await this.ticketModel.findByIdAndUpdate(ticketId, {
      assigned_to: new Types.ObjectId(userId),
      assigned_at: new Date(),
    });
  }

  formatTicketResponse(ticket: any) {
    return {
      id: ticket._id.toString(),
      title: ticket.title,
      description: ticket.description,
      category: ticket.category_id
        ? {
            id: ticket.category_id._id?.toString(),
            name: ticket.category_id.name,
            color: ticket.category_id.color,
          }
        : null,
      priority: ticket.priority,
      status: ticket.status,
      is_urgent: ticket.is_urgent,
      author: ticket.author_id
        ? {
            id: ticket.author_id._id?.toString(),
            name: ticket.author_id.name,
            email: ticket.author_id.email,
          }
        : null,
      assigned_to: ticket.assigned_to
        ? {
            id: ticket.assigned_to._id?.toString(),
            name: ticket.assigned_to.name,
            email: ticket.assigned_to.email,
          }
        : null,
      tags:
        ticket.tags?.map((tag: any) => ({
          id: tag._id?.toString(),
          name: tag.name,
          color: tag.color,
        })) || [],
      reply_count: ticket.reply_count,
      created_at: ticket.createdAt,
      updated_at: ticket.updatedAt,
    };
  }

  formatReplyResponse(reply: any) {
    return {
      id: reply._id.toString(),
      content: reply.content,
      reply_type: reply.reply_type,
      is_solution: reply.is_solution,
      user: {
        id: reply.user_id._id?.toString(),
        name: reply.user_id.name,
        email: reply.user_id.email,
      },
      created_at: reply.createdAt,
      updated_at: reply.updatedAt,
    };
  }
}
