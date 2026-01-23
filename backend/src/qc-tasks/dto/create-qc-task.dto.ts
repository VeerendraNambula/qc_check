import {
  IsArray,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

class CreateChecklistItemDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsInt()
  @IsOptional()
  order?: number;
}

export class CreateQcTaskDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => CreateChecklistItemDto)
  checklists?: CreateChecklistItemDto[];
}
