import { IsString, IsNotEmpty } from 'class-validator';

export class ReviewRoleUpgradeRequestDto {
  @IsString()
  @IsNotEmpty()
  admin_notes: string;
}
