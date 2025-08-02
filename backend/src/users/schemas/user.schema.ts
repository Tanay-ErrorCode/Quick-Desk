import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type UserDocument = User & Document & {
  id: string;
  _id: Types.ObjectId;
};

export enum UserRole {
  END_USER = 'End User',
  SUPPORT_AGENT = 'Support Agent',
  ADMIN = 'Admin',
}

export enum UserStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  PENDING = 'pending',
}

@Schema({ 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
})
export class User {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, unique: true, index: true })
  email: string;

  @Prop({ required: true })
  password_hash: string;

  @Prop({ enum: UserRole, default: UserRole.END_USER, index: true })
  role: UserRole;

  @Prop({ enum: UserStatus, default: UserStatus.ACTIVE, index: true })
  status: UserStatus;

  @Prop({ default: null })
  email_verified_at: Date;

  @Prop({ default: null })
  profile_picture: string;

  @Prop({ default: null })
  phone: string;

  @Prop({ default: null })
  department: string;
}

export const UserSchema = SchemaFactory.createForClass(User);

UserSchema.set('toJSON', {
  virtuals: true,
  transform: function(doc: any, ret: any) {
    ret.id = ret._id?.toString();
    delete ret._id;
    delete ret.__v;
    return ret;
  }
});

UserSchema.virtual('id').get(function(this: UserDocument) {
  return this._id?.toHexString();
});