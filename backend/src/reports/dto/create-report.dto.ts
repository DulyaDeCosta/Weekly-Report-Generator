import { IsOptional, IsUUID, Matches } from 'class-validator';

export class CreateReportDto {
  @IsUUID('4', { message: 'Please select a valid project' })
  projectId: string;

  @IsOptional()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: 'weekStart must be in YYYY-MM-DD format',
  })
  weekStart?: string;
}
