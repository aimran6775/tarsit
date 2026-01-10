import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsBoolean, IsDateString, IsEnum, IsNumber, IsOptional, IsString, IsUUID, MaxLength, Min, MinLength } from 'class-validator';

export enum DiscountType {
  PERCENTAGE = 'PERCENTAGE',
  FIXED_AMOUNT = 'FIXED_AMOUNT',
}

export class CreatePromotionDto {
  @ApiProperty({ description: 'Promo code (unique per business)', example: 'SUMMER20' })
  @IsString()
  @MinLength(3)
  @MaxLength(20)
  code!: string;

  @ApiProperty({ description: 'Display name', example: 'Summer Sale 20% Off' })
  @IsString()
  @MinLength(3)
  @MaxLength(100)
  name!: string;

  @ApiPropertyOptional({ description: 'Description of the promotion' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @ApiProperty({ enum: DiscountType, default: DiscountType.PERCENTAGE })
  @IsEnum(DiscountType)
  discountType!: DiscountType;

  @ApiProperty({ description: 'Discount value (% or fixed amount)', example: 20 })
  @IsNumber()
  @Min(0)
  discountValue!: number;

  @ApiPropertyOptional({ description: 'Minimum order value to apply discount' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  minOrderValue?: number;

  @ApiPropertyOptional({ description: 'Maximum discount amount (for percentage discounts)' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  maxDiscount?: number;

  @ApiPropertyOptional({ description: 'Total times this code can be used' })
  @IsOptional()
  @IsNumber()
  @Min(1)
  usageLimit?: number;

  @ApiPropertyOptional({ description: 'Times a single user can use this code', default: 1 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  perUserLimit?: number;

  @ApiPropertyOptional({ description: 'When the promotion becomes valid' })
  @IsOptional()
  @IsDateString()
  validFrom?: string;

  @ApiPropertyOptional({ description: 'When the promotion expires' })
  @IsOptional()
  @IsDateString()
  validUntil?: string;

  @ApiPropertyOptional({ description: 'Service IDs this promo applies to (empty = all)' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  serviceIds?: string[];
}

export class UpdatePromotionDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(100)
  name?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @ApiPropertyOptional({ enum: DiscountType })
  @IsOptional()
  @IsEnum(DiscountType)
  discountType?: DiscountType;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  discountValue?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  minOrderValue?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  maxDiscount?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(1)
  usageLimit?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(1)
  perUserLimit?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  validFrom?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  validUntil?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  serviceIds?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  active?: boolean;
}

export class ValidatePromoCodeDto {
  @ApiProperty({ description: 'The promo code to validate' })
  @IsString()
  code!: string;

  @ApiPropertyOptional({ description: 'Service ID (to check service-specific promos)' })
  @IsOptional()
  @IsString()
  serviceId?: string;

  @ApiPropertyOptional({ description: 'Order total (to check minimum order value)' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  orderTotal?: number;
}

export class UsePromotionDto {
  @ApiProperty({ description: 'Promo code to use' })
  @IsString()
  code!: string;

  @ApiPropertyOptional({ description: 'Associated appointment ID' })
  @IsOptional()
  @IsUUID()
  appointmentId?: string;

  @ApiProperty({ description: 'Discount amount applied' })
  @IsNumber()
  @Min(0)
  discountAmount!: number;
}
