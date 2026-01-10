import {
    IsEnum,
    IsOptional,
    IsString,
    MaxLength,
    MinLength,
} from 'class-validator';

export enum ReportTarget {
  BUSINESS = 'BUSINESS',
  REVIEW = 'REVIEW',
  USER = 'USER',
  MESSAGE = 'MESSAGE',
}

export enum ReportReason {
  SPAM = 'SPAM',
  INAPPROPRIATE = 'INAPPROPRIATE',
  FAKE = 'FAKE',
  HARASSMENT = 'HARASSMENT',
  MISLEADING = 'MISLEADING',
  COPYRIGHT = 'COPYRIGHT',
  SCAM = 'SCAM',
  OTHER = 'OTHER',
}

export class CreateReportDto {
  @IsEnum(ReportTarget)
  targetType!: ReportTarget;

  @IsString()
  targetId!: string;

  @IsEnum(ReportReason)
  reason!: ReportReason;

  @IsOptional()
  @IsString()
  @MinLength(10)
  @MaxLength(1000)
  description?: string;
}
