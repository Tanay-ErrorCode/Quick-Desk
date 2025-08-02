import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Attachment, AttachmentDocument } from './schemas/attachment.schema';
import { CreateAttachmentDto } from './dto/create-attachment.dto';

@Injectable()
export class AttachmentsService {
  constructor(
    @InjectModel(Attachment.name) private attachmentModel: Model<AttachmentDocument>,
  ) {}

  async create(ticketId: string, createAttachmentDto: CreateAttachmentDto, uploadedBy: string): Promise<Attachment> {
    const attachment = new this.attachmentModel({
      ...createAttachmentDto,
      ticket_id: new Types.ObjectId(ticketId),
      uploaded_by: new Types.ObjectId(uploadedBy),
    });
    return attachment.save();
  }

  async findByTicket(ticketId: string): Promise<Attachment[]> {
    return this.attachmentModel
      .find({ ticket_id: new Types.ObjectId(ticketId) })
      .populate('uploaded_by', 'name email')
      .exec();
  }

  async findByReply(replyId: string): Promise<Attachment[]> {
    return this.attachmentModel
      .find({ reply_id: new Types.ObjectId(replyId) })
      .populate('uploaded_by', 'name email')
      .exec();
  }

  async findOne(id: string): Promise<Attachment> {
    const attachment = await this.attachmentModel
      .findById(id)
      .populate('uploaded_by', 'name email')
      .exec();
    
    if (!attachment) {
      throw new NotFoundException('Attachment not found');
    }
    
    return attachment;
  }

  async remove(id: string, userId: string): Promise<void> {
    const attachment = await this.attachmentModel.findById(id);
    
    if (!attachment) {
      throw new NotFoundException('Attachment not found');
    }
    
    // Check if user is the uploader or has admin/agent role
    if (attachment.uploaded_by.toString() !== userId) {
      throw new NotFoundException('You can only delete your own attachments');
    }
    
    await this.attachmentModel.findByIdAndDelete(id);
  }
}
