import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CurrencyDto {
  @ApiProperty({ example: 'curr_123' })
  id!: string;

  @ApiProperty({ example: 'USD' })
  code!: string;

  @ApiProperty({ example: 'US Dollar' })
  name!: string;

  @ApiProperty({ example: '$' })
  symbol!: string;

  @ApiProperty({ example: 'before', enum: ['before', 'after'] })
  symbolPosition!: string;

  @ApiProperty({ example: 2 })
  decimalPlaces!: number;

  @ApiProperty({ example: ',' })
  thousandSeparator!: string;

  @ApiProperty({ example: '.' })
  decimalSeparator!: string;

  @ApiProperty({ example: 1.0 })
  exchangeRateToUSD!: number;

  @ApiPropertyOptional({ example: '2026-01-11T00:00:00Z' })
  lastRateUpdate?: Date;
}

export class RegionDto {
  @ApiProperty({ example: 'reg_123' })
  id!: string;

  @ApiProperty({ example: 'AE' })
  code!: string;

  @ApiProperty({ example: 'United Arab Emirates' })
  name!: string;

  @ApiPropertyOptional({ example: 'الإمارات العربية المتحدة' })
  nativeName?: string;

  @ApiProperty({ example: 'en' })
  defaultLanguage!: string;

  @ApiProperty({ example: ['en', 'ar'] })
  supportedLangs!: string[];

  @ApiProperty({ example: 'Asia/Dubai' })
  timezone!: string;

  @ApiProperty({ example: false })
  isRTL!: boolean;

  @ApiPropertyOptional({ example: '🇦🇪' })
  flagEmoji?: string;

  @ApiPropertyOptional({ example: '+971' })
  phoneCode?: string;

  @ApiProperty({ example: 1 })
  order!: number;

  @ApiProperty({ type: CurrencyDto })
  currency!: CurrencyDto;
}

export class RegionListResponseDto {
  @ApiProperty({ type: [RegionDto] })
  regions!: RegionDto[];

  @ApiProperty({ example: 11 })
  total!: number;
}

export class RegionWithBusinessCountDto extends RegionDto {
  @ApiProperty({ example: 42 })
  businessCount!: number;
}
