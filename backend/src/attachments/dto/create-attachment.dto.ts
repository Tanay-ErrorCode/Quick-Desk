import { IsOptional, IsString } from 'class-validator';
import { Types } from 'mongoose';

export class CreateAttachmentDto {
  @IsOptional()
  reply_id?: Types.ObjectId;

  @IsString()
  original_name: string;

  @IsString()
  stored_name: string;

  @IsString()
  file_path: string;

  file_size: number;

  @IsString()
  mime_type: string;
}
