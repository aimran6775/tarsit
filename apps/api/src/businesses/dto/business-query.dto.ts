import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsNumber, Min, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';

export class BusinessQueryDto {
  @ApiProperty({ required: false, description: 'Search by business name' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiProperty({ required: false, description: 'Filter by category ID' })
  @IsOptional()
  @IsString()
  categoryId?: string;

  @ApiProperty({ required: false, description: 'Filter by city' })
  @IsOptional()
  @IsString()
  city?: string;

  @ApiProperty({ required: false, description: 'Filter by state' })
  @IsOptional()
  @IsString()
  state?: string;

  @ApiProperty({ required: false, description: 'Filter by price range', enum: ['BUDGET', 'MODERATE', 'EXPENSIVE'] })
  @IsOptional()
  @IsEnum(['BUDGET', 'MODERATE', 'EXPENSIVE'])
  priceRange?: 'BUDGET' | 'MODERATE' | 'EXPENSIVE';

  @ApiProperty({ required: false, description: 'Latitude for nearby search' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  latitude?: number;

  @ApiProperty({ required: false, description: 'Longitude for nearby search' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  longitude?: number;

  @ApiProperty({ required: false, description: 'Radius in kilometers', default: 10 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  radius?: number;

  @ApiProperty({ required: false, description: 'Only verified businesses', default: false })
  @IsOptional()
  verified?: boolean;

  @ApiProperty({ required: false, description: 'Page number', default: 1, minimum: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @ApiProperty({ required: false, description: 'Items per page', default: 20, minimum: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  limit?: number = 20;

  @ApiProperty({ 
    required: false, 
    description: 'Sort by field', 
    enum: ['name', 'rating', 'createdAt'],
    default: 'createdAt'
  })
  @IsOptional()
  @IsEnum(['name', 'rating', 'createdAt'])
  sortBy?: 'name' | 'rating' | 'createdAt' = 'createdAt';

  @ApiProperty({ required: false, description: 'Sort order', enum: ['asc', 'desc'], default: 'desc' })
  @IsOptional()
  @IsEnum(['asc', 'desc'])
  sortOrder?: 'asc' | 'desc' = 'desc';
}
