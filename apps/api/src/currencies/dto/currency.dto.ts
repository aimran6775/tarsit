import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class CurrencyResponseDto {
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

  @ApiProperty({ example: 1.0, description: 'Exchange rate to convert to USD' })
  exchangeRateToUSD!: number;

  @ApiPropertyOptional({ example: '2026-01-11T00:00:00Z' })
  lastRateUpdate?: Date;
}

export class CurrencyListResponseDto {
  @ApiProperty({ type: [CurrencyResponseDto] })
  currencies!: CurrencyResponseDto[];

  @ApiProperty({ example: 9 })
  total!: number;
}

export class ConvertCurrencyDto {
  @ApiProperty({ example: 100, description: 'Amount to convert' })
  @IsNumber()
  @Min(0)
  amount!: number;

  @ApiProperty({ example: 'AED', description: 'Source currency code' })
  @IsString()
  from!: string;

  @ApiProperty({ example: 'USD', description: 'Target currency code' })
  @IsString()
  to!: string;
}

export class ConversionResultDto {
  @ApiProperty({ example: 100 })
  originalAmount!: number;

  @ApiProperty({ example: 'AED' })
  fromCurrency!: string;

  @ApiProperty({ example: 27.23 })
  convertedAmount!: number;

  @ApiProperty({ example: 'USD' })
  toCurrency!: string;

  @ApiProperty({ example: 0.2723 })
  exchangeRate!: number;

  @ApiProperty({ example: 'AED 100.00 = $27.23 USD' })
  formatted!: string;
}

export class FormatPriceDto {
  @ApiProperty({ example: 100 })
  @IsNumber()
  @Min(0)
  amount!: number;

  @ApiProperty({ example: 'USD' })
  @IsString()
  currencyCode!: string;

  @ApiPropertyOptional({ example: 'en-US', description: 'Locale for formatting' })
  @IsOptional()
  @IsString()
  locale?: string;
}
