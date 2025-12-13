import { IsOptional, IsString, IsEnum, IsDateString } from 'class-validator';

export enum ReportType {
  USER_ACTIVITY = 'user-activity',
  BUSINESS_PERFORMANCE = 'business-performance',
  REVENUE_ANALYSIS = 'revenue-analysis',
  APPOINTMENT_ANALYTICS = 'appointment-analytics',
  REVIEW_SUMMARY = 'review-summary',
  PLATFORM_HEALTH = 'platform-health',
}

export enum ReportFormat {
  PDF = 'pdf',
  CSV = 'csv',
  XLSX = 'xlsx',
}

export class GenerateReportDto {
  @IsEnum(ReportType)
  type: ReportType;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsEnum(ReportFormat)
  format?: ReportFormat;
}
