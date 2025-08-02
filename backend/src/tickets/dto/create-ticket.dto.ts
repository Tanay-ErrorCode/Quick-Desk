import {
  IsString,
  IsOptional,
  IsEnum,
  IsBoolean,
  IsMongoId,
  IsArray,
  MaxLength,
} from 'class-validator';
import { TicketPriority } from '../schemas/ticket.schema';

export class CreateTicketDto {
  @IsString()
  @MaxLength(255)
  title: string;

  @IsString()
  description: string;

  @IsMongoId()
  category_id: string;

  @IsEnum(TicketPriority)
  @IsOptional()
  priority?: TicketPriority;

  @IsBoolean()
  @IsOptional()
  is_urgent?: boolean;

  @IsArray()
  @IsMongoId({ each: true })
  @IsOptional()
  tags?: string[];
}
