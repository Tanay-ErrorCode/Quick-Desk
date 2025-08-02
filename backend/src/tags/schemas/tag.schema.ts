import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type TagDocument = Tag &
  Document & {
    id: string;
    _id: Types.ObjectId;
  };

@Schema({
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
})
export class Tag {
  @Prop({ required: true, maxlength: 50 })
  name: string;

  @Prop({ type: Types.ObjectId, ref: 'Category', required: true, index: true })
  category_id: Types.ObjectId;

  @Prop({ default: '#6c757d', maxlength: 7 })
  color: string;

  @Prop({ default: true, index: true })
  is_active: boolean;
}

export const TagSchema = SchemaFactory.createForClass(Tag);

// Create compound index for unique tag per category
TagSchema.index({ name: 1, category_id: 1 }, { unique: true });

TagSchema.set('toJSON', {
  virtuals: true,
  transform: function (doc: any, ret: any) {
    ret.id = ret._id?.toString();
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

TagSchema.virtual('id').get(function (this: TagDocument) {
  return this._id?.toHexString();
});

TagSchema.virtual('category', {
  ref: 'Category',
  localField: 'category_id',
  foreignField: '_id',
  justOne: true,
});
