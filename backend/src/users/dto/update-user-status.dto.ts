import { IsEnum, IsString, IsOptional } from 'class-validator';
import { UserStatus } from '../schemas/user.schema';

export class UpdateUserStatusDto {
  @IsEnum(UserStatus)
  status: UserStatus;

  @IsString()
  @IsOptional()
  reason?: string;
}
