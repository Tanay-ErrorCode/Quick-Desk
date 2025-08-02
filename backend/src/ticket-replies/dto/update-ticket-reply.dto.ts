import { IsString, IsOptional } from 'class-validator';

export class UpdateTicketReplyDto {
  @IsOptional()
  @IsString()
  content?: string;
}
