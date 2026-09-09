import { IsOptional, IsUUID, Matches } from 'class-validator';

export class DashboardQueryDto {
  @IsOptional()
  @IsUUID('4')
  projectId?: string;

  @IsOptional()
  @Matches(/^\d{4}-\d{2}-\d{2}$/)
  weekStart?: string;

  @IsOptional()
  @Matches(/^\d{4}-\d{2}-\d{2}$/)
  weekEnd?: string;
}
