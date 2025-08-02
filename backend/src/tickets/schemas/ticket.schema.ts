import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type TicketDocument = Ticket &
  Document & {
    id: string;
    _id: Types.ObjectId;
  };

export enum TicketPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
}

export enum TicketStatus {
  OPEN = 'open',
  IN_PROGRESS = 'in_progress',
  RESOLVED = 'resolved',
  CLOSED = 'closed',
}

@Schema({
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
})
export class Ticket {
  @Prop({ required: true, maxlength: 255 })
  title: string;

  @Prop({ required: true })
  description: string;

  @Prop({ type: Types.ObjectId, ref: 'Category', required: true, index: true })
  category_id: Types.ObjectId;

  @Prop({ enum: TicketPriority, default: TicketPriority.MEDIUM, index: true })
  priority: TicketPriority;

  @Prop({ enum: TicketStatus, default: TicketStatus.OPEN, index: true })
  status: TicketStatus;

  @Prop({ default: false, index: true })
  is_urgent: boolean;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  author_id: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', default: null, index: true })
  assigned_to: Types.ObjectId;

  @Prop({ default: null })
  assigned_at: Date;

  @Prop({ default: null })
  resolved_at: Date;

  @Prop({ default: null })
  closed_at: Date;

  @Prop({ default: null })
  last_reply_at: Date;

  @Prop({ default: 0 })
  reply_count: number;

  @Prop({ default: 0 })
  internal_notes_count: number;

  @Prop({ type: [Types.ObjectId], ref: 'Tag', default: [] })
  tags: Types.ObjectId[];
}

export const TicketSchema = SchemaFactory.createForClass(Ticket);

TicketSchema.set('toJSON', {
  virtuals: true,
  transform: function (doc: any, ret: any) {
    ret.id = ret._id?.toString();
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

TicketSchema.virtual('id').get(function (this: TicketDocument) {
  return this._id?.toString();
});

// Virtual population for relationships
TicketSchema.virtual('category', {
  ref: 'Category',
  localField: 'category_id',
  foreignField: '_id',
  justOne: true,
});

TicketSchema.virtual('author', {
  ref: 'User',
  localField: 'author_id',
  foreignField: '_id',
  justOne: true,
});

TicketSchema.virtual('assignee', {
  ref: 'User',
  localField: 'assigned_to',
  foreignField: '_id',
  justOne: true,
});

TicketSchema.virtual('ticket_tags', {
  ref: 'Tag',
  localField: 'tags',
  foreignField: '_id',
});
