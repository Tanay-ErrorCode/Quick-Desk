import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type RoleUpgradeRequestDocument = RoleUpgradeRequest & Document;

export enum RequestStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

export enum UserRole {
  END_USER = 'End User',
  SUPPORT_AGENT = 'Support Agent',
  ADMIN = 'Admin',
}

@Schema({ timestamps: true })
export class RoleUpgradeRequest {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  user_id: Types.ObjectId;

  @Prop({ type: String, enum: UserRole, required: true })
  current_role: UserRole;

  @Prop({ type: String, enum: UserRole, required: true })
  requested_role: UserRole;

  @Prop({ required: true })
  reason: string;

  @Prop({ type: String, enum: RequestStatus, default: RequestStatus.PENDING })
  status: RequestStatus;

  @Prop({ type: Types.ObjectId, ref: 'User', default: null })
  reviewed_by: Types.ObjectId;

  @Prop({ default: null })
  reviewed_at: Date;

  @Prop({ default: null })
  admin_notes: string;
}

export const RoleUpgradeRequestSchema = SchemaFactory.createForClass(RoleUpgradeRequest);

// Indexes
RoleUpgradeRequestSchema.index({ user_id: 1 });
RoleUpgradeRequestSchema.index({ status: 1 });
RoleUpgradeRequestSchema.index({ createdAt: 1 });
