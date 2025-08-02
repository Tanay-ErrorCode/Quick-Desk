import { IsString, IsEnum } from 'class-validator';
import { UserRole } from '../schemas/user.schema';

export class UpdateUserRoleDto {
  @IsEnum(UserRole)
  role: UserRole;

  @IsString()
  notes?: string;
}
