import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  Max,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { TaskPriority, TaskStatus } from '../../entities/task.entity';

export class TaskDto {
  @IsString()
  @MaxLength(200)
  name: string;

  @IsEnum(TaskPriority)
  priority: TaskPriority;

  @IsEnum(TaskStatus)
  status: TaskStatus;

  @IsInt()
  @Min(0)
  @Max(100)
  plannedPercentage: number;

  @IsInt()
  @Min(0)
  @Max(100)
  actualPercentage: number;

  @IsInt()
  @Min(0)
  timePlannedHours: number;

  @IsInt()
  @Min(0)
  timeSpentHours: number;

  @IsOptional()
  @IsString()
  deliverable?: string;
}

export class BlockerDto {
  @IsString()
  @MaxLength(1000)
  description: string;

  @IsBoolean()
  isKey: boolean;
}

export class AchievementDto {
  @IsString()
  @MaxLength(1000)
  description: string;

  @IsBoolean()
  isKey: boolean;
}

export class UpdateReportDto {
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TaskDto)
  tasks?: TaskDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BlockerDto)
  blockers?: BlockerDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AchievementDto)
  achievements?: AchievementDto[];

  @IsOptional()
  @IsString()
  @MaxLength(5000)
  tasksPlannedNextWeek?: string;

  @IsOptional()
  @IsString()
  @MaxLength(5000)
  notes?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  hoursDevelopment?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  hoursTesting?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  hoursMeetings?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  hoursDocumentation?: number;
}
