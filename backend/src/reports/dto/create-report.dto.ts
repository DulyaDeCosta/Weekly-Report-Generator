import { IsUUID } from 'class-validator';

export class CreateReportDto {
  @IsUUID('4', { message: 'Please select a valid project' })
  projectId: string;
}
