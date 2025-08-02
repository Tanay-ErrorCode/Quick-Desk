import { IsString, IsOptional, IsEnum, IsBoolean } from 'class-validator';
import { ReplyType } from '../../ticket-replies/schemas/ticket-reply.schema';

export class CreateTicketReplyDto {
  @IsString()
  content: string;

  @IsEnum(ReplyType)
  @IsOptional()
  reply_type?: ReplyType;

  @IsBoolean()
  @IsOptional()
  is_solution?: boolean;
}
