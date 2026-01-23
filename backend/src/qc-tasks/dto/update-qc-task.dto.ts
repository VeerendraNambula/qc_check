import { PartialType } from '@nestjs/mapped-types';
import { CreateQcTaskDto } from './create-qc-task.dto';
import { IsEnum, IsOptional } from 'class-validator';
import { TaskStatus } from '@prisma/client';

export class UpdateQcTaskDto extends PartialType(CreateQcTaskDto) {
  @IsOptional()
  @IsEnum(TaskStatus)
  status?: TaskStatus;
}
