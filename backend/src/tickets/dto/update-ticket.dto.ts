import { IsString, IsOptional, IsEnum, MaxLength } from 'class-validator';
import { TicketPriority, TicketStatus } from '../schemas/ticket.schema';

export class UpdateTicketDto {
  @IsString()
  @IsOptional()
  @MaxLength(255)
  title?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum(TicketPriority)
  @IsOptional()
  priority?: TicketPriority;

  @IsEnum(TicketStatus)
  @IsOptional()
  status?: TicketStatus;
}
