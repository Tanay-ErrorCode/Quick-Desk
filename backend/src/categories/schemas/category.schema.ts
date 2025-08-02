import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type CategoryDocument = Category &
  Document & {
    id: string;
    _id: Types.ObjectId;
  };

@Schema({
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
})
export class Category {
  @Prop({ required: true, unique: true, maxlength: 100, index: true })
  name: string;

  @Prop({ required: true })
  description: string;

  @Prop({ default: '#007bff', maxlength: 7 })
  color: string;

  @Prop({ default: '📂', maxlength: 10 })
  icon: string;

  @Prop({ default: true, index: true })
  is_active: boolean;
}

export const CategorySchema = SchemaFactory.createForClass(Category);

CategorySchema.set('toJSON', {
  virtuals: true,
  transform: function (doc: any, ret: any) {
    ret.id = ret._id?.toString();
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

CategorySchema.virtual('id').get(function (this: CategoryDocument) {
  return this._id?.toString();
});
