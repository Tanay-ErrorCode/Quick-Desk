import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type TicketReplyDocument = TicketReply &
  Document & {
    id: string;
    _id: Types.ObjectId;
  };

export enum ReplyType {
  PUBLIC = 'public',
  INTERNAL_NOTE = 'internal_note',
}

@Schema({
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
})
export class TicketReply {
  @Prop({ type: Types.ObjectId, ref: 'Ticket', required: true, index: true })
  ticket_id: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  user_id: Types.ObjectId;

  @Prop({ required: true })
  content: string;

  @Prop({ enum: ReplyType, default: ReplyType.PUBLIC, index: true })
  reply_type: ReplyType;

  @Prop({ default: false })
  is_solution: boolean;
}

export const TicketReplySchema = SchemaFactory.createForClass(TicketReply);

TicketReplySchema.set('toJSON', {
  virtuals: true,
  transform: function (doc: any, ret: any) {
    ret.id = ret._id?.toString();
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

TicketReplySchema.virtual('id').get(function (this: TicketReplyDocument) {
  return this._id?.toString();
});
