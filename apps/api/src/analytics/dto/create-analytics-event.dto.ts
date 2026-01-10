import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsEnum, IsOptional, IsObject } from 'class-validator';

export enum AnalyticsEventType {
  BUSINESS_VIEW = 'BUSINESS_VIEW',
  BUSINESS_SEARCH = 'BUSINESS_SEARCH',
  BUSINESS_CONTACT = 'BUSINESS_CONTACT',
  BUSINESS_DIRECTION = 'BUSINESS_DIRECTION',
  BUSINESS_WEBSITE = 'BUSINESS_WEBSITE',
}

export class CreateAnalyticsEventDto {
  @ApiProperty({ example: 'cuid123', description: 'Business ID' })
  @IsString()
  businessId!: string;

  @ApiProperty({ enum: AnalyticsEventType, description: 'Event type' })
  @IsEnum(AnalyticsEventType)
  eventType!: AnalyticsEventType;

  @ApiPropertyOptional({
    example: { source: 'search', query: 'coffee shops' },
    description: 'Additional event metadata',
  })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, unknown>;
}
