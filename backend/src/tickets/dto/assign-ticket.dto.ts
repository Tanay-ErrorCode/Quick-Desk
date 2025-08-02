import { IsMongoId, IsString, IsOptional } from 'class-validator';

export class AssignTicketDto {
  @IsMongoId()
  assigned_to: string;

  @IsString()
  @IsOptional()
  notes?: string;
}
