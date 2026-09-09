import { IsEnum, IsInt, IsOptional, IsString, IsUUID, Max, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ReportStatus } from '../../entities/report.entity';

export class ListReportsDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 10;

  @IsOptional()
  @IsEnum(ReportStatus)
  status?: ReportStatus;

  @IsOptional()
  @IsUUID('4')
  projectId?: string;

  @IsOptional()
  @IsUUID('4')
  authorId?: string;

  @IsOptional()
  @IsString()
  weekStart?: string;

  @IsOptional()
  @IsString()
  weekEnd?: string;
}
