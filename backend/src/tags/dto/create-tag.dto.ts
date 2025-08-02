import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsHexColor,
  IsMongoId,
  MaxLength,
} from 'class-validator';

export class CreateTagDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  name: string;

  @IsMongoId()
  category_id: string;

  @IsOptional()
  @IsHexColor()
  color?: string;
}
