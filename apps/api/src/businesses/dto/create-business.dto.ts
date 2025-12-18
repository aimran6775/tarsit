import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

class BusinessHours {
  @ApiProperty({ example: '09:00', required: false })
  @IsOptional()
  @IsString()
  open?: string;

  @ApiProperty({ example: '18:00', required: false })
  @IsOptional()
  @IsString()
  close?: string;

  @ApiProperty({ example: true, required: false })
  @IsOptional()
  closed?: boolean;
}

export class CreateBusinessDto {
  @ApiProperty({ example: 'QuickFix Phone Repair' })
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(100)
  name!: string;

  @ApiProperty({ example: 'Professional iPhone and Android repair services' })
  @IsString()
  @IsNotEmpty()
  @MinLength(20)
  @MaxLength(2000)
  description!: string;

  @ApiProperty({ example: 'category-uuid-here' })
  @IsString()
  @IsNotEmpty()
  categoryId!: string;

  @ApiProperty({ example: '123 Market Street' })
  @IsString()
  @IsNotEmpty()
  addressLine1!: string;

  @ApiProperty({ example: 'Suite 100', required: false })
  @IsOptional()
  @IsString()
  addressLine2?: string;

  @ApiProperty({ example: 'San Francisco' })
  @IsString()
  @IsNotEmpty()
  city!: string;

  @ApiProperty({ example: 'CA' })
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(2)
  state!: string;

  @ApiProperty({ example: '94102' })
  @IsString()
  @IsNotEmpty()
  zipCode!: string;

  @ApiProperty({ example: 'USA', default: 'USA' })
  @IsString()
  @IsNotEmpty()
  country!: string;

  @ApiProperty({ example: 37.7749, description: 'Latitude' })
  @IsNumber()
  @Min(-90)
  @Max(90)
  latitude!: number;

  @ApiProperty({ example: -122.4194, description: 'Longitude' })
  @IsNumber()
  @Min(-180)
  @Max(180)
  longitude!: number;

  @ApiProperty({ example: '+14155551234' })
  @IsString()
  @IsNotEmpty()
  phone!: string;

  @ApiProperty({ example: 'contact@example.com', required: false })
  @IsOptional()
  @IsString()
  email?: string;

  @ApiProperty({ example: 'https://example.com', required: false })
  @IsOptional()
  @IsString()
  website?: string;

  @ApiProperty({ enum: ['BUDGET', 'MODERATE', 'EXPENSIVE'], example: 'MODERATE' })
  @IsEnum(['BUDGET', 'MODERATE', 'EXPENSIVE'])
  priceRange!: 'BUDGET' | 'MODERATE' | 'EXPENSIVE';

  @ApiProperty({
    example: {
      monday: { open: '09:00', close: '18:00' },
      tuesday: { open: '09:00', close: '18:00' },
      wednesday: { open: '09:00', close: '18:00' },
      thursday: { open: '09:00', close: '18:00' },
      friday: { open: '09:00', close: '18:00' },
      saturday: { open: '10:00', close: '16:00' },
      sunday: { closed: true },
    },
    required: false,
  })
  @IsOptional()
  @IsObject()
  hours?: Record<string, BusinessHours>;

  @ApiProperty({ example: ['parking', 'wifi', 'wheelchair-accessible'], required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  amenities?: string[];

  @ApiProperty({ example: ['en', 'es'], required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  languages?: string[];

  @ApiProperty({ example: true, required: false })
  @IsOptional()
  @IsBoolean()
  showReviews?: boolean;

  @ApiProperty({ example: true, required: false })
  @IsOptional()
  @IsBoolean()
  showServices?: boolean;

  @ApiProperty({ example: true, required: false })
  @IsOptional()
  @IsBoolean()
  showHours?: boolean;

  @ApiProperty({ example: true, required: false })
  @IsOptional()
  @IsBoolean()
  showPhone?: boolean;

  @ApiProperty({ example: true, required: false })
  @IsOptional()
  @IsBoolean()
  showWebsite?: boolean;

  @ApiProperty({ example: true, required: false })
  @IsOptional()
  @IsBoolean()
  messagingEnabled?: boolean;
}
