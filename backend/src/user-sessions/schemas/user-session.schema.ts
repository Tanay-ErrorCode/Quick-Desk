import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type UserSessionDocument = UserSession & Document;

@Schema({ timestamps: true })
export class UserSession {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  user_id: Types.ObjectId;

  @Prop({ required: true, unique: true })
  token: string;

  @Prop({ default: null })
  ip_address: string;

  @Prop({ default: null })
  user_agent: string;

  @Prop({ required: true })
  expires_at: Date;
}

export const UserSessionSchema = SchemaFactory.createForClass(UserSession);

// Indexes
UserSessionSchema.index({ token: 1 });
UserSessionSchema.index({ user_id: 1 });
UserSessionSchema.index({ expires_at: 1 });
