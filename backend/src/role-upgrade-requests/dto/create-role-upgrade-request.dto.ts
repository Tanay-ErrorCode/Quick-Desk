import { IsEnum, IsString, IsNotEmpty } from 'class-validator';
import { UserRole } from '../schemas/role-upgrade-request.schema';

export class CreateRoleUpgradeRequestDto {
  @IsEnum(UserRole)
  requested_role: UserRole;

  @IsString()
  @IsNotEmpty()
  reason: string;
}
