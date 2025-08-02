import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type AttachmentDocument = Attachment & Document;

@Schema({ timestamps: true })
export class Attachment {
  @Prop({ type: Types.ObjectId, ref: 'Ticket', required: true })
  ticket_id: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'TicketReply', default: null })
  reply_id: Types.ObjectId;

  @Prop({ required: true })
  original_name: string;

  @Prop({ required: true })
  stored_name: string;

  @Prop({ required: true })
  file_path: string;

  @Prop({ required: true })
  file_size: number;

  @Prop({ required: true })
  mime_type: string;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  uploaded_by: Types.ObjectId;
}

export const AttachmentSchema = SchemaFactory.createForClass(Attachment);

// Indexes
AttachmentSchema.index({ ticket_id: 1 });
AttachmentSchema.index({ reply_id: 1 });
AttachmentSchema.index({ uploaded_by: 1 });
