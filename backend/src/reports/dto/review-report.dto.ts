import { IsEnum, IsOptional, IsString, MaxLength, ValidateIf } from 'class-validator';
import { ReviewActionType } from '../../entities/review-action.entity';

export class ReviewReportDto {
  @IsEnum(ReviewActionType)
  actionType: ReviewActionType;

  @ValidateIf((dto) => dto.actionType === ReviewActionType.REQUESTED_CHANGES)
  @IsString()
  @MaxLength(2000)
  comment: string;
}
