import { IsEnum, IsString, IsOptional, IsBoolean } from 'class-validator';
import { Types } from 'mongoose';
import { NotificationType } from '../schemas/notification.schema';

export class CreateNotificationDto {
  @IsEnum(NotificationType)
  type: NotificationType;

  @IsString()
  title: string;

  @IsString()
  message: string;

  @IsOptional()
  @IsBoolean()
  is_urgent?: boolean;

  @IsOptional()
  @IsString()
  action_url?: string;

  @IsOptional()
  @IsString()
  action_text?: string;

  @IsOptional()
  sender_id?: Types.ObjectId;

  @IsOptional()
  ticket_id?: Types.ObjectId;
}
