import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsNumber, IsOptional, IsString, MaxLength, Min } from 'class-validator';

// Supported currency codes
const SUPPORTED_CURRENCIES = ['USD', 'AED', 'SAR', 'GBP', 'EUR', 'CAD', 'AUD', 'PKR', 'INR'] as const;

export class CreateServiceDto {
  @ApiProperty({ example: 'cuid123', description: 'Business ID' })
  @IsString()
  businessId!: string;

  @ApiProperty({ example: 'Haircut & Styling', description: 'Service name' })
  @IsString()
  @MaxLength(100)
  name!: string;

  @ApiProperty({
    example: 'Professional haircut with consultation and styling',
    description: 'Service description',
  })
  @IsString()
  @MaxLength(500)
  description!: string;

  @ApiProperty({ example: 45.0, description: 'Service price' })
  @IsNumber()
  @Min(0)
  price!: number;

  @ApiProperty({ 
    example: 'USD', 
    description: 'Currency code for the price',
    enum: SUPPORTED_CURRENCIES,
    default: 'USD',
    required: false
  })
  @IsOptional()
  @IsString()
  @IsIn(SUPPORTED_CURRENCIES)
  currencyCode?: string;

  @ApiProperty({ example: 60, description: 'Duration in minutes', required: false })
  @IsOptional()
  @IsNumber()
  @Min(1)
  duration?: number;
}
