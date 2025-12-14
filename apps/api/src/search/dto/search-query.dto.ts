import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsOptional,
  IsString,
  IsNumber,
  Min,
  Max,
  IsInt,
  IsEnum,
  IsBoolean,
} from 'class-validator';
import { PriceRange } from '@prisma/client';

export class SearchQueryDto {
  @ApiPropertyOptional({
    description: 'Search query text',
    example: 'coffee shop',
  })
  @IsString()
  @IsOptional()
  q?: string;

  @ApiPropertyOptional({
    description: 'Category ID filter',
    example: 'category-uuid',
  })
  @IsString()
  @IsOptional()
  categoryId?: string;

  @ApiPropertyOptional({
    description: 'Category slug filter (alternative to categoryId)',
    example: 'home-services',
  })
  @IsString()
  @IsOptional()
  categorySlug?: string;

  @ApiPropertyOptional({
    description: 'Latitude for distance-based search',
    example: 40.7128,
  })
  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  latitude?: number;

  @ApiPropertyOptional({
    description: 'Longitude for distance-based search',
    example: -74.006,
  })
  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  longitude?: number;

  @ApiPropertyOptional({
    description: 'Maximum distance in miles',
    example: 10,
    default: 25,
  })
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(100)
  @IsOptional()
  radius?: number = 25;

  @ApiPropertyOptional({
    description: 'Minimum rating (0-5)',
    example: 4,
  })
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(5)
  @IsOptional()
  minRating?: number;

  @ApiPropertyOptional({
    description: 'Price range filter',
    enum: PriceRange,
    example: 'MODERATE',
  })
  @IsEnum(PriceRange)
  @IsOptional()
  priceRange?: PriceRange;

  @ApiPropertyOptional({
    description: 'Filter for verified businesses only',
    example: true,
  })
  @Type(() => Boolean)
  @IsBoolean()
  @IsOptional()
  verified?: boolean;

  @ApiPropertyOptional({
    description: 'Filter for featured businesses only',
    example: false,
  })
  @Type(() => Boolean)
  @IsBoolean()
  @IsOptional()
  featured?: boolean;

  @ApiPropertyOptional({
    description: 'Filter for businesses open now',
    example: true,
  })
  @Type(() => Boolean)
  @IsBoolean()
  @IsOptional()
  openNow?: boolean;

  @ApiPropertyOptional({
    description: 'City filter',
    example: 'New York',
  })
  @IsString()
  @IsOptional()
  city?: string;

  @ApiPropertyOptional({
    description: 'State filter',
    example: 'NY',
  })
  @IsString()
  @IsOptional()
  state?: string;

  @ApiPropertyOptional({
    description: 'Sort by field',
    enum: ['relevance', 'rating', 'distance', 'reviewCount', 'name'],
    default: 'relevance',
  })
  @IsString()
  @IsOptional()
  sortBy?: string = 'relevance';

  @ApiPropertyOptional({
    description: 'Page number',
    default: 1,
    minimum: 1,
  })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  page?: number = 1;

  @ApiPropertyOptional({
    description: 'Number of results per page',
    default: 20,
    minimum: 1,
    maximum: 100,
  })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  @IsOptional()
  limit?: number = 20;
}
