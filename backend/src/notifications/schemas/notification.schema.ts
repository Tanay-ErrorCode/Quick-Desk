import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type NotificationDocument = Notification & Document;

export enum NotificationType {
  TICKET = 'ticket',
  SYSTEM = 'system',
  ASSIGNMENT = 'assignment',
  MENTION = 'mention',
  UPGRADE = 'upgrade',
  REMINDER = 'reminder',
}

@Schema({ timestamps: true })
export class Notification {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  user_id: Types.ObjectId;

  @Prop({ type: String, enum: NotificationType, required: true })
  type: NotificationType;

  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  message: string;

  @Prop({ default: false })
  is_read: boolean;

  @Prop({ default: false })
  is_urgent: boolean;

  @Prop({ default: null })
  action_url: string;

  @Prop({ default: null })
  action_text: string;

  @Prop({ type: Types.ObjectId, ref: 'User', default: null })
  sender_id: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Ticket', default: null })
  ticket_id: Types.ObjectId;
}

export const NotificationSchema = SchemaFactory.createForClass(Notification);

// Indexes
NotificationSchema.index({ user_id: 1 });
NotificationSchema.index({ is_read: 1 });
NotificationSchema.index({ is_urgent: 1 });
NotificationSchema.index({ type: 1 });
NotificationSchema.index({ createdAt: 1 });
